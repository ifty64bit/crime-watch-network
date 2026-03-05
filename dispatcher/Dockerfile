# ============================================================
# Dispatch Radio — RabbitMQ Message Broker
# Crime Watch Network · Microservice Architecture
# ============================================================
# Uses the official RabbitMQ image with the Management UI
# plugin enabled, on Alpine Linux for a minimal footprint.
# ============================================================

FROM rabbitmq:4.2-management-alpine

# ---- metadata ----
LABEL maintainer="crime-watch-network"
LABEL service="dispatch-radio"
LABEL description="RabbitMQ message broker for inter-service communication"

# ---- default environment (override at runtime / compose) ----
ENV RABBITMQ_DEFAULT_USER=dispatch
ENV RABBITMQ_DEFAULT_PASS=changeme
ENV RABBITMQ_DEFAULT_VHOST=/

# ---- ports ----
# 5672  → AMQP protocol (producer / consumer connections)
# 15672 → Management UI  (http://localhost:15672)
EXPOSE 5672 15672

# ---- healthcheck ----
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD rabbitmq-diagnostics -q check_running && \
      rabbitmq-diagnostics -q check_local_alarms

# ---- entrypoint (inherited from base image) ----
# The official image already sets the correct ENTRYPOINT and CMD,
# so we do not override them here.
