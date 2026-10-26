<?php
/**
 * گام ۲ پرداخت: بعد از اینکه کاربر از صفحه‌ی بانک برگشت، سایت trackId را به اینجا می‌فرستد.
 * اینجا با زیبال چک می‌شود که پرداخت واقعاً موفق بوده و مبلغش درست است؛ بعد سفارش «پرداخت‌شده» می‌شود.
 * تأیید نهایی فقط اینجا (روی سرور) انجام می‌شود، نه روی مرورگر — تا کسی نتواند پرداخت را جعل کند.
 */
require __DIR__ . '/lib.php';
cors();

$in    = body();
$track = (int)($in['trackId'] ?? 0);
$id    = $in['orderId'] ?? '';
if (!$track)    say(['paid' => false, 'error' => 'track'], 400);

$order = load_order($id);
if (!$order)    say(['paid' => false, 'error' => 'not_found'], 404);

// اگر قبلاً تأیید شده (مثلاً کاربر صفحه را دوباره باز کرده)، همان نتیجه را بده و دوباره با بانک تماس نگیر.
if (($order['status'] ?? '') === 'paid') {
  say(['paid' => true, 'ref' => $order['ref'] ?? '', 'already' => true]);
}

$c = cfg();
$res = zibal($c['zibal_verify'], ['merchant' => $c['merchant'], 'trackId' => $track]);

// result=100 یعنی پرداخت موفق و تأیید شد؛ result=201 یعنی قبلاً تأیید شده بود.
$ok = in_array(($res['result'] ?? 0), [100, 201], true);
// مبلغی که بانک برمی‌گرداند باید دقیقاً همان مبلغ سفارش باشد (جلوی دستکاری مبلغ را می‌گیرد).
if ($ok && isset($res['amount']) && (int)$res['amount'] !== (int)$order['amount']) $ok = false;

if (!$ok) {
  $order['status'] = 'failed';
  save_order($order);
  say(['paid' => false, 'result' => $res['result'] ?? 0, 'message' => $res['message'] ?? 'not verified']);
}

$order['status'] = 'paid';
$order['ref']    = (string)($res['refNumber'] ?? $track);
$order['paidAt'] = time();
$order['card']   = $res['cardNumber'] ?? null;            // زیبال فقط شماره‌ی کارتِ ماسک‌شده (مثل ۶۲۷۴****۱۲۳۴) می‌دهد، نه کل کارت
save_order($order);

say(['paid' => true, 'ref' => $order['ref']]);
