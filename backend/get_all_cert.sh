#!/bin/bash

rm -f *.crt *.key *.csr *.srl


## config for localhost (not reelmia.com)

openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt \
  -subj "/C=US/ST=State/L=City/O=Org/CN=reelmia-ca"

openssl genrsa -out vps.key 2048
openssl req -new -key vps.key -out vps.csr \
  -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"
openssl x509 -req -in vps.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out vps.crt -days 365 -sha256

openssl genrsa -out worker-1.key 2048
openssl req -new -key worker-1.key -out worker-1.csr \
  -subj "/C=US/ST=State/L=City/O=Org/CN=worker-1"
openssl x509 -req -in worker-1.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out worker-1.crt -days 365 -sha256

rm -f *.csr *.srl

echo "Certificates generated successfully!"
