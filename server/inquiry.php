<?php
/**
 * استعلام سریع (سفارش عمده / رزرو سالن / استعلام حمل)
 * سایت فرم را به اینجا می‌فرستد (INQUIRY.api در src/js/11-inquiry.js).
 * اینجا درخواست ذخیره می‌شود و — اگر سامانه‌ی پیامک تنظیم شده باشد — یک پیامک تأیید برای مشتری فرستاده می‌شود.
 *
 * سامانه‌ی پیامک: در config.php مقدارهای 'sms_url' و 'sms_key' را از پنل سرویس پیامکی خود (مثل کاوه‌نگار یا sms.ir) بگذارید.
 * تا وقتی خالی باشند فقط ذخیره انجام می‌شود.
 */
require __DIR__ . '/lib.php';
cors();

$in = body();
if (!empty($in['website'])) say(['ok' => true]);                       // تله‌ی ربات‌ها

$name  = trim(mb_substr((string)($in['name'] ?? ''), 0, 60));
$phone = preg_replace('/\D/', '', (string)($in['phone'] ?? ''));
$type  = in_array($in['type'] ?? '', ['bulk', 'storage', 'shipping'], true) ? $in['type'] : 'bulk';
if (mb_strlen($name) < 3)                  say(['error' => 'name'], 400);
if (!preg_match('/^09\d{9}$/', $phone))    say(['error' => 'phone'], 400);

/* جلوی ارسال پشت‌سرهم از یک شماره را می‌گیرد (حداکثر ۵ درخواست در ساعت) */
$c   = cfg();
$dir = $c['data_dir'] . '/inquiries';
if (!is_dir($dir)) mkdir($dir, 0770, true);
$recent = glob("$dir/*-$phone.json") ?: [];
$recent = array_filter($recent, fn($f) => filemtime($f) > time() - 3600);
if (count($recent) >= 5) say(['error' => 'too_many'], 429);

$id = preg_replace('/[^A-Z0-9\-]/', '', (string)($in['id'] ?? '')) ?: ('SR-' . time());
$req = [
  'id'      => $id,
  'name'    => $name,
  'phone'   => $phone,
  'type'    => $type,
  'product' => mb_substr((string)($in['product'] ?? ''), 0, 40),
  'qty'     => mb_substr((string)($in['qty'] ?? ''), 0, 40),
  'note'    => mb_substr((string)($in['note'] ?? ''), 0, 400),
  'date'    => time(),
  'status'  => 'review',
];
file_put_contents("$dir/" . time() . "-$phone.json", json_encode($req, JSON_UNESCAPED_UNICODE), LOCK_EX);

/* پیامک تأیید به مشتری */
if (!empty($c['sms_url']) && !empty($c['sms_key'])) {
  $types = ['bulk' => 'سفارش عمده', 'storage' => 'رزرو سالن', 'shipping' => 'استعلام حمل'];
  $text  = "نخل و ماه\n{$types[$type]} شما با کد {$id} ثبت شد. کارشناس ما تا ۲ ساعت کاری تماس می‌گیرد.";
  $ch = curl_init($c['sms_url']);
  curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
    CURLOPT_POSTFIELDS => http_build_query(['apikey' => $c['sms_key'], 'receptor' => $phone, 'message' => $text])]);
  curl_exec($ch); curl_close($ch);                                      // پیامک نرسید؟ درخواست ذخیره شده و از پنل دیده می‌شود
}
say(['ok' => true, 'id' => $id]);
