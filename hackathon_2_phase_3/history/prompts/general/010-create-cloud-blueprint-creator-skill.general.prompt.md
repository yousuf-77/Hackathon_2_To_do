---
id: 010
title: create-cloud-blueprint-creator-skill
stage: general
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","cloud-blueprint","mcp-control-plane","spec-driven-governance","cloud-native"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/cloud-blueprint-creator/SKILL.md
 - history/prompts/general/010-create-cloud-blueprint-creator-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (blueprint specs, MCP control plane, CI/CD, governance)
---

## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "cloud-blueprint-creator".

Skill purpose: Create Cloud-Native Blueprints for Phase 3 bonus. Spec-driven deployment/governance of MCP tools/agents using Agent Skills. Reference Spec-Kit Plus blueprint patterns and MCP control plane concepts.

When to activate automatically: When creating blueprints, deployment skills, spec-driven governance, or Phase 3 cloud-native bonus.

Make it high-quality hybrid skill: YAML frontmatter, steps for blueprint Markdown/YAML specs, reusable MCP deployment patterns.

## Response snapshot

Created the "cloud-blueprint-creator" production-grade hybrid skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: cloud-blueprint-creator
- description: Comprehensive guide for creating cloud-native blueprints for MCP tools/agents with spec-driven deployment governance, covering MCP control plane patterns, Agent Skills orchestration, Kubernetes manifests, CI/CD integration, observability, and security
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
- related_skills: mcp-tool-definition, multi-agent-orchestration, agents-sdk-integration, mcp-tool-engineer

**Key Sections Included:**
1. Quick Start: Blueprint directory structure with manifests/, terraform/, ci-cd/, monitoring/, tests/
2. Blueprint Metadata Template: YAML frontmatter for blueprint specs with version, target environment, compliance flags
3. Complete Blueprint Specification Template: Executive summary, architecture, deployment manifests, observability, security, migration/rollback
4. Architecture Specifications: Component diagrams (Mermaid), service interactions, MCP control plane integration patterns
5. Deployment Manifests: Kubernetes Deployment, Service, ConfigMap for MCP configuration
6. Observability & Operations: Structured logging (JSON), Prometheus metrics, health checks, alerting rules
7. Security & Compliance: JWT authentication, network policies, secret management strategies
8. CI/CD Integration: Complete GitHub Actions workflow for validate → build → deploy
9. Migration & Rollback: Blue-green deployment strategy with instant rollback procedures
10. Feature Flags: Feature flag integration patterns
11. Blueprint Validation Checklist: 16-point validation checklist before /sp.implement
12. Spec-Driven Governance Integration: How blueprints integrate with /sp.implement workflow
13. Blueprint Spec Template: Spec-Kit Plus aligned template with user stories, requirements, success criteria
14. Production Deployment Patterns: MCP Tool Server blueprint, Multi-Agent Orchestration blueprint
15. Testing Strategy: Blueprint validation tests for structure, Kubernetes manifests, CI/CD configuration
16. Cloud Provider Specifics: AWS EKS (Terraform), Google Cloud GKE (BackendConfig), Azure AKS (Bicep)
17. 16-Point Quality Assurance Checklist

**Code Examples Provided:**
- Blueprint directory structure with manifests/, terraform/, ci-cd/, monitoring/, tests/ subdirectories
- Blueprint metadata YAML template with version, target environment, MCP server, agent skills, spec compliance
- Complete blueprint specification template with executive summary, architecture, deployment, observability, security, rollback
- Kubernetes Deployment with replicas, resources, liveness/readiness probes
- Kubernetes Service with ClusterIP type
- ConfigMap for MCP configuration with server settings, tool definitions, security options
- MCP Control Plane patterns: Tool Registry, Execution Engine, State Manager, Circuit Breaker
- Structured logging with structlog (JSON format)
- Prometheus metrics: counters, histograms, gauges for tool execution
- Prometheus alerting rules for high error rates
- FastAPI health check endpoints (/health, /ready)
- JWT authentication middleware with HTTPBearer
- Kubernetes NetworkPolicy for ingress/egress control
- GitHub Actions workflow: validate-blueprint → build-and-push → deploy-to-cluster
- Blue-green deployment with service selector update for instant rollback
- Feature flag integration with dynamic tool enabling
- Blueprint validation tests (pytest) for structure, manifests, CI/CD
- AWS EKS Terraform configuration with cluster and task definitions
- Google Cloud GKE BackendConfig and ManagedCertificate
- Azure AKS Bicep template for cluster and deployment

**Blueprint Patterns:**
- MCP Todo Server Blueprint: 5 Todo tools with JWT and user isolation
- Multi-Agent Orchestration Blueprint: Coordinator-specialist pattern, message bus, circuit breaker
- Spec-Driven Integration: Blueprints integrate with /sp.implement workflow via spec → tasks → implement

**Integration Patterns:**
- Works with Spec-Kit Plus template methodology
- Integrates with MCP tool definitions and agent orchestration
- Supports multiple cloud providers (AWS, GCP, Azure)
- CI/CD automated from commit to deployment
- Blue-green deployment with instant rollback capability
- Comprehensive observability (logs, metrics, traces, alerts)

Saved to: `.claude/skills/cloud-blueprint-creator/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous creation of cloud-native blueprints for MCP tools/agents with spec-driven governance for Phase 3 bonus features
- 🧪 Tests: Skill structure validation passed; includes testing strategy for blueprint validation, Kubernetes manifests, and CI/CD configuration
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from CNCF agentic systems patterns, Spec-Kit Plus templates, MCP documentation, Kubernetes best practices, and cloud-native deployment patterns

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, properly links to existing MCP and agent orchestration skills
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "cloud blueprint", "deployment spec", or "spec-driven governance" mentions in future prompts

## Sources Referenced

- [CNCF Agentic Systems GitHub Issues](https://github.com/cncf/tag-convergence/issues?q=is%3Aissue+is%3Aopen+agentic)
- [Vectara: MCP for Agentic AI Blog](https://vectara.com/blog/mcp-model-context-protocol-for-agentic-ai/)
- [Model Context Protocol Official Documentation](https://modelcontextprotocol.io/docs)
- [Kubernetes Deployment Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [ArgoCD GitOps Documentation](https://argoproj.github.io/argo-cd/)
- [Martin Fowler: Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
