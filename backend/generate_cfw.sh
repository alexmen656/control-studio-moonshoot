#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Reelmia Worker Certificate Generator ===${NC}"

read -p "Enter worker ID: " worker_id

if [ -z "$worker_id" ]; then
  echo "❌ Worker ID cannot be empty"
  exit 1
fi

if [ ! -f "ca.crt" ] || [ ! -f "ca.key" ]; then
  echo "❌ CA certificates not found. Run init first."
  exit 1
fi

echo -e "${BLUE}Generating certificate for worker-${worker_id}...${NC}"

openssl genrsa -out worker-${worker_id}.key 2048
openssl req -new -key worker-${worker_id}.key -out worker-${worker_id}.csr \
  -subj "/C=US/ST=State/L=City/O=Org/CN=worker-${worker_id}"
openssl x509 -req -in worker-${worker_id}.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out worker-${worker_id}.crt -days 365 -sha256

rm -f worker-${worker_id}.csr
rm -f ca.srl

echo -e "${GREEN}✓ worker-${worker_id} certificate generated!${NC}"
echo ""
echo "Files created:"
echo "  - worker-${worker_id}.crt"
echo "  - worker-${worker_id}.key"
