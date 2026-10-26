<?php
/** ابزارهای مشترک: خواندن تنظیمات، پاسخ JSON، CORS، ذخیره‌ی سفارش، تماس با زیبال. */

function cfg() { static $c; return $c ?: ($c = require __DIR__ . '/config.php'); }

/** پاسخ JSON و پایان کار. */
function say($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

/** فقط سایت خودمان اجازه دارد؛ درخواست‌های دیگر رد می‌شوند. */
function cors() {
  $allow = cfg()['allow_origin'];
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($allow === '*' || $origin === $allow) header('Access-Control-Allow-Origin: ' . ($allow === '*' ? '*' : $origin));
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  header('Vary: Origin');
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') say(['error' => 'method'], 405);
  if ($allow !== '*' && $origin !== $allow) say(['error' => 'origin'], 403);
}

/** بدنه‌ی JSON درخواست. */
function body() { return json_decode(file_get_contents('php://input'), true) ?: []; }

/** مسیر فایل یک سفارش روی دیسک. */
function order_path($id) {
  $id = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)$id);          // جلوی دستکاری مسیر
  if ($id === '') say(['error' => 'order_id'], 400);
  $dir = cfg()['data_dir'];
  if (!is_dir($dir)) @mkdir($dir, 0770, true);
  return $dir . '/' . $id . '.json';
}

function load_order($id) { $p = order_path($id); return is_file($p) ? json_decode(file_get_contents($p), true) : null; }
function save_order($o)  { file_put_contents(order_path($o['id']), json_encode($o, JSON_UNESCAPED_UNICODE), LOCK_EX); }

/** تماس POST با زیبال و گرفتن پاسخ JSON. */
function zibal($url, $payload) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 20,
  ]);
  $res = curl_exec($ch);
  if ($res === false) { $e = curl_error($ch); curl_close($ch); return ['result' => 0, 'message' => 'connect: ' . $e]; }
  curl_close($ch);
  return json_decode($res, true) ?: ['result' => 0, 'message' => 'bad response'];
}
