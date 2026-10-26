<?php
/**
 * گام ۱ پرداخت: سایت سفارش را به اینجا می‌فرستد.
 * اینجا سفارش ذخیره می‌شود، از زیبال trackId گرفته می‌شود و آدرس صفحه‌ی بانک به سایت برمی‌گردد.
 * کاربر روی صفحه‌ی امن خودِ بانک شماره کارت و رمز را وارد می‌کند؛ این سرور هیچ اطلاعات کارتی نمی‌بیند و نمی‌گیرد.
 */
require __DIR__ . '/lib.php';
cors();

$in  = body();
$id  = $in['orderId'] ?? '';
$amt = (int)($in['amount'] ?? 0);            // مبلغ به ریال (سایت تومان×۱۰ می‌فرستد)
$mob = preg_replace('/\D/', '', (string)($in['mobile'] ?? ''));

if ($id === '')            say(['error' => 'order_id'], 400);
if ($amt < 11000)          say(['error' => 'amount'], 400);          // حداقل مبلغ درگاه: ۱,۱۰۰ تومان

// نکته‌ی امنیتی: مبلغ از سمت کاربر می‌آید و قابل دستکاری است.
// برای امنیت کامل، این سرور باید مبلغ را از روی لیست محصولات و سبدِ خودش دوباره حساب کند.
// فعلاً مبلغ را ذخیره می‌کنیم و در گام تأیید، مبلغی که بانک برمی‌گرداند باید دقیقاً با همین یکی باشد.

$c = cfg();
$order = [
  'id'       => preg_replace('/[^A-Za-z0-9_\-]/', '', $id),
  'amount'   => $amt,
  'mobile'   => $mob,
  'items'    => $in['items']   ?? null,
  'addr'     => $in['addr']    ?? null,
  'name'     => $in['name']    ?? null,
  'status'   => 'unpaid',
  'createdAt'=> time(),
];

// زیبال اجازه نمی‌دهد یک orderId دو بار پرداخت شود؛ پس برای هر تلاش یک شناسه‌ی یکتا به زیبال می‌دهیم،
// ولی سفارش را با همان شناسه‌ی اصلی (بدون شماره‌ی تلاش) ذخیره می‌کنیم تا گام تأیید آن را پیدا کند.
$attempt = (int)($in['attempt'] ?? 1);
$res = zibal($c['zibal_request'], [
  'merchant'    => $c['merchant'],
  'amount'      => $amt,
  'callbackUrl' => $c['callback_url'],
  'orderId'     => $order['id'] . '_' . $attempt,
  'mobile'      => $mob,
  'description' => $in['description'] ?? ('سفارش ' . $order['id'] . ' · نخل جیرفت'),
]);

if (($res['result'] ?? 0) != 100 || empty($res['trackId'])) {
  say(['error' => 'zibal', 'result' => $res['result'] ?? 0, 'message' => $res['message'] ?? 'request failed'], 502);
}

$order['trackId'] = $res['trackId'];
save_order($order);

// trackId و آدرس صفحه‌ی بانک به سایت می‌رود؛ سایت کاربر را به startUrl می‌برد.
say(['trackId' => $res['trackId'], 'startUrl' => $c['zibal_start'] . $res['trackId']]);
