# Nginx 설정 가이드 (Hetzner 배포용)

기존 Nginx가 설치된 서버에 x402-poc 앱을 연결하는 설정입니다.

## 전제 조건

- Nginx 설치됨
- Docker Compose로 앱이 `localhost:3000`에서 실행 중
- 도메인 DNS가 서버 IP를 가리키고 있음

---

## 1. Nginx 사이트 설정 추가

`/etc/nginx/sites-available/x402-poc` 파일 생성:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

## 2. 사이트 활성화

```bash
sudo ln -s /etc/nginx/sites-available/x402-poc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. HTTPS 설정 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

Certbot이 자동으로 443 블록과 HTTP→HTTPS 리다이렉트를 추가합니다.

---

## 4. HTTPS 적용 후 최종 설정 예시

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

---

## 앱 배포 명령 요약

```bash
# 최초 배포
git clone <repo> && cd x402-protocol-poc
cp .env.example .env && vi .env
docker compose up -d

# 코드 업데이트 시
git pull
docker compose up -d --build
```
