#!/bin/bash

set -e

mkdir -p keys/{vps,worker}
mkdir -p certs/{vps,worker,ca}

# VPS: ES256 Keys
openssl ecparam -genkey -name prime256v1 -noout -out keys/vps/vps-private-temp.pem
openssl pkcs8 -topk8 -nocrypt -in keys/vps/vps-private-temp.pem -out keys/vps/vps-private.pem
rm keys/vps/vps-private-temp.pem
openssl ec -in keys/vps/vps-private.pem -pubout -out keys/vps/vps-public.pem

# Worker: RSA-4096 Keys
openssl genrsa -out keys/worker/worker-private-temp.pem 4096
openssl pkcs8 -topk8 -nocrypt -in keys/worker/worker-private-temp.pem -out keys/worker/worker-private.pem
rm keys/worker/worker-private-temp.pem
openssl rsa -in keys/worker/worker-private.pem -pubout -out keys/worker/worker-public.pem

# CA
openssl genrsa -out certs/ca/ca-key.pem 4096
openssl req -new -x509 -days 3650 -key certs/ca/ca-key.pem -out certs/ca/ca-cert.pem \
  -subj "/C=DE/ST=State/L=City/O=Org/OU=CA/CN=Root CA"
