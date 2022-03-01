{{/*
Products API
*/}}
{{- define "products.name" -}}
{{- printf "%s-%s" .Release.Name "products" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "products.deploy" -}}
{{- printf "%s-%s-%s"  .Release.Name "products" "deploy" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "products.service" -}}
{{- printf "%s-%s-%s"  .Release.Name "products" "service" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "products.port" -}}
{{- printf "%s-%s-%s"  .Release.Name "products" "port" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
DYNAMODB
*/}}
{{- define "dynamodb.service" -}}
{{- if .Values.dynamodb.create }}
{{- printf "%s-%s-%s" .Release.Name "dynamodb" "service" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s" .Values.dynamodb.endpoint }}
{{- end }}
{{- end }}

{{- define "dynamodb.name" -}}
{{- printf "%s-%s" .Release.Name "dynamodb" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dynamodb.deploy" -}}
{{- printf "%s-%s-%s" .Release.Name "dynamodb" "deploy" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dynamodb.pvc" -}}
{{- printf "%s-%s-%s" .Values.namespace "dynamodb" "pvc" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dynamodb.port" -}}
{{- printf "%s-%s-%s" .Release.Name "dynamodb" "port" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dynamodb.endpoint" -}}
{{- printf "%s://%s:%d"  "http" (include "dynamodb.service" .) (int .Values.dynamodb.port) }}
{{- end }}

{{/*
Secrets
*/}}
{{- define "products.secrets" -}}
{{- printf "%s-%s-%s" .Release.Name "products" "secrets" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}