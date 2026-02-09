---
name: multi-agent-orchestration
description: |
  This skill guides Claude Code to orchestrate multiple AI agents for Phase 3 advanced Todo management. Covers agent architecture design, workflow coordination, inter-agent communication, agent registry, task routing, agent composition patterns, error handling, state management, and monitoring. Integrates with OpenAI Agents SDK, coordinates specialized agents (NLP parser, Todo CRUD, Voice input, Urdu translator), and implements production orchestration patterns. This skill activates automatically when users mention multi-agent orchestration, agent workflow coordination, specialized agent coordination, Phase 3 agent systems, agent communication patterns, or multi-agent architecture.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
related_skills:
  - agents-sdk-integration
  - nlp-intent-parser
  - voice-input-handler
  - urdu-nlp-translator
  - chatbot-integrator
---

# Multi-Agent Orchestration Skill

## Overview

This skill provides comprehensive guidance for designing and implementing multi-agent orchestration systems for Phase 3 Todo management. It covers agent architecture patterns, workflow coordination mechanisms, inter-agent communication protocols, agent registry design, task routing strategies, agent composition patterns, error handling, state management, and monitoring for production multi-agent systems using OpenAI Agents SDK.

## When to Use This Skill

- Orchestrating multiple specialized agents for complex tasks
- Designing agent workflow coordination systems
- Implementing inter-agent communication protocols
- Creating agent registries for agent discovery
- Routing tasks to appropriate agents dynamically
- Composing multiple agents for complex workflows
- Managing shared state across distributed agents
- Monitoring and debugging multi-agent systems
- Phase 3 advanced agent architecture

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing agent implementations, backend structure, FastAPI routes |
| **Conversation** | User's orchestration requirements, agent capabilities, coordination needs |
| **Skill References** | OpenAI Agents SDK docs, orchestration patterns, multi-agent best practices |
| **User Guidelines** | Performance requirements, fault tolerance, monitoring needs |

Ensure all required context is gathered before implementing.

## Agent Architecture Design

### Define Specialized Agents

```python
# backend/app/agents/registry.py
"""
Agent registry for discovering and managing specialized agents.
"""
from typing import Dict, Any, Callable, Optional, List
from enum import Enum
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


class AgentType(Enum):
    """Types of specialized agents in the system."""
    NLP_PARSER = "nlp_parser"
    TODO_CRUD = "todo_crud"
    VOICE_INPUT = "voice_input"
    URDU_TRANSLATOR = "urdu_translator"
    ORCHESTRATOR = "orchestrator"


@dataclass
class AgentCapability:
    """Defines what an agent can do."""
    agent_type: AgentType
    name: str
    description: str
    can_handle: List[str]  # List of intents/tasks
    priority: int  # Lower number = higher priority


@dataclass
class AgentMessage:
    """Message structure for inter-agent communication."""
    from_agent: AgentType
    to_agent: AgentType
    message_type: str  # request, response, notification, error
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    timestamp: float = None


class AgentRegistry:
    """
    Registry for discovering and managing agents.

    Provides agent discovery, capability matching, and agent lifecycle management.
    """

    def __init__(self):
        self._agents: Dict[AgentType, Any] = {}
        self._capabilities: Dict[AgentType, AgentCapability] = {}

    def register_agent(
        self,
        agent_type: AgentType,
        agent_instance: Any,
        capability: AgentCapability,
    ) -> None:
        """Register an agent with the registry."""
        self._agents[agent_type] = agent_instance
        self._capabilities[agent_type] = capability
        logger.info(f"Registered agent: {capability.name} ({agent_type.value})")

    def get_agent(self, agent_type: AgentType) -> Optional[Any]:
        """Get agent instance by type."""
        return self._agents.get(agent_type)

    def find_agents_for_task(self, task: str) -> List[AgentType]:
        """Find agents capable of handling a specific task."""
        capable_agents = []

        for agent_type, capability in self._capabilities.items():
            if task in capability.can_handle:
                capable_agents.append((agent_type, capability.priority))

        # Sort by priority (lower number = higher priority)
        capable_agents.sort(key=lambda x: x[1])

        return [agent_type for agent_type, _ in capable_agents]

    def get_all_capabilities(self) -> Dict[AgentType, AgentCapability]:
        """Get all registered agent capabilities."""
        return self._capabilities.copy()


# Global agent registry
agent_registry = AgentRegistry()
```

### Initialize Specialized Agents

```python
# backend/app/agents/__init__.py
"""
Initialize and register all specialized agents.
"""
from app.agents.registry import agent_registry, AgentType, AgentCapability
from app.agents.nlp_agent import NLPAgent
from app.agents.todo_crud_agent import TodoCRUDAgent
from app.agents.voice_agent import VoiceInputAgent
from app.agents.urdu_agent import UrduTranslatorAgent


def initialize_agents():
    """Initialize all specialized agents and register them."""
    # NLP Parser Agent
    nlp_agent = NLPAgent()
    agent_registry.register_agent(
        agent_type=AgentType.NLP_PARSER,
        agent_instance=nlp_agent,
        capability=AgentCapability(
            agent_type=AgentType.NLP_PARSER,
            name="NLP Parser",
            description="Parses natural language into structured commands",
            can_handle=["parse_intent", "extract_parameters", "detect_language"],
            priority=1,
        )
    )

    # Todo CRUD Agent
    todo_agent = TodoCRUDAgent()
    agent_registry.register_agent(
        agent_type=AgentType.TODO_CRUD,
        agent_instance=todo_agent,
        capability=AgentCapability(
            agent_type=AgentType.TODO_CRUD,
            name="Todo CRUD",
            description="Performs Todo CRUD operations with database",
            can_handle=["create_task", "list_tasks", "update_task", "delete_task", "complete_task"],
            priority=2,
        )
    )

    # Voice Input Agent
    voice_agent = VoiceInputAgent()
    agent_registry.register_agent(
        agent_type=AgentType.VOICE_INPUT,
        agent_instance=voice_agent,
        capability=AgentCapability(
            agent_type=AgentType.VOICE_INPUT,
            name="Voice Input",
            description="Processes voice input and converts to text",
            can_handle=["transcribe_audio", "detect_voice_commands", "handle_microphone"],
            priority=3,
        )
    )

    # Urdu Translator Agent
    urdu_agent = UrduTranslatorAgent()
    agent_registry.register_agent(
        agent_type=AgentType.URDU_TRANSLATOR,
        agent_instance=urdu_agent,
        capability=AgentCapability(
            agent_type=AgentType.URDU_TRANSLATOR,
            name="Urdu Translator",
            description="Translates Urdu to English and vice versa",
            can_handle=["translate_urdu_to_english", "translate_english_to_urdu", "detect_urdu"],
            priority=4,
        )
    )

    logger.info("All specialized agents initialized and registered")
```

## Workflow Orchestration

### Orchestration Engine

```python
# backend/app/orchestration/engine.py
"""
Multi-agent orchestration engine for coordinating agent workflows.
"""
from typing import Dict, Any, List, Optional
from app.agents.registry import agent_registry, AgentType, AgentMessage
import logging
import asyncio
import time
from datetime import datetime

logger = logging.getLogger(__name__)


class OrchestrationEngine:
    """
    Coordinates multiple agents to complete complex workflows.

    Implements coordinator-specialist pattern where orchestrator delegates
    tasks to specialized agents based on capabilities and availability.
    """

    def __init__(self):
        self.current_workflow: Optional[str] = None
        self.workflow_state: Dict[str, Any] = {}
        self.agent_metrics: Dict[str, Dict[str, Any]] = {}

    async def orchestrate_request(
        self,
        user_request: str,
        user_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Orchestrate agents to handle a user request.

        Args:
            user_request: Natural language request from user
            user_id: User ID for scoping
            context: Optional context (conversation history, etc.)

        Returns:
            Orchestration result with agent responses and final output

        Example:
            await orchestrate.orchestrate_request(
                "Add a high priority task for shopping",
                user_id="user-123"
            )
        """
        start_time = time.time()
        workflow_id = f"wf_{int(time.time())}"

        logger.info(f"Starting orchestration {workflow_id} for user {user_id}")

        try:
            # Step 1: Language Detection & Translation (if needed)
            language_result = await self._execute_agent_workflow(
                workflow_id=workflow_id,
                agent_type=AgentType.NLP_PARSER,
                task="detect_language",
                input_data={"text": user_request},
                user_id=user_id,
            )

            detected_lang = language_result.get("language", "en")

            # Step 2: If Urdu detected, translate to English
            if detected_lang == "ur":
                translation_result = await self._execute_agent_workflow(
                    workflow_id=workflow_id,
                    agent_type=AgentType.URDU_TRANSLATOR,
                    task="translate_urdu_to_english",
                    input_data={"text": user_request},
                    user_id=user_id,
                )
                user_request = translation_result.get("translation", user_request)

            # Step 3: Parse Intent
            intent_result = await self._execute_agent_workflow(
                workflow_id=workflow_id,
                agent_type=AgentType.NLP_PARSER,
                task="parse_intent",
                input_data={"text": user_request},
                user_id=user_id,
            )

            intent = intent_result.get("intent")
            parameters = intent_result.get("parameters", {})

            logger.info(f"Parsed intent: {intent} with parameters: {parameters}")

            # Step 4: Execute Todo operation via Todo CRUD agent
            if intent in ["create_task", "list_tasks", "update_task", "delete_task", "complete_task"]:
                todo_result = await self._execute_agent_workflow(
                    workflow_id=workflow_id,
                    agent_type=AgentType.TODO_CRUD,
                    task=intent,
                    input_data=parameters,
                    user_id=user_id,
                )

                # Step 5: If original was Urdu, translate response back
                final_response = todo_result.get("response", "Operation completed")
                if detected_lang == "ur":
                    response_translation = await self._execute_agent_workflow(
                        workflow_id=workflow_id,
                        agent_type=AgentType.URDU_TRANSLATOR,
                        task="translate_english_to_urdu",
                        input_data={"text": final_response},
                        user_id=user_id,
                    )
                    final_response = response_translation.get("translation", final_response)

                execution_time = time.time() - start_time

                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "intent": intent,
                    "response": final_response,
                    "agent_chain": ["nlp_parser"] + (["urdu_translator"] if detected_lang == "ur" else []) + ["todo_crud"],
                    "execution_time": execution_time,
                    "language": detected_lang,
                }

            else:
                return {
                    "success": False,
                    "workflow_id": workflow_id,
                    "error": f"Unknown intent: {intent}",
                    "agent_chain": ["nlp_parser"],
                }

        except Exception as e:
            logger.error(f"Orchestration error in {workflow_id}: {e}")
            return {
                "success": False,
                "workflow_id": workflow_id,
                "error": str(e),
                "agent_chain": [],
            }

    async def _execute_agent_workflow(
        self,
        workflow_id: str,
        agent_type: AgentType,
        task: str,
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Execute a single agent workflow with error handling and metrics.

        Args:
            workflow_id: Workflow execution ID for tracking
            agent_type: Type of agent to execute
            task: Task to execute
            input_data: Input parameters for the task
            user_id: User ID for scoping

        Returns:
            Agent execution result
        """
        agent = agent_registry.get_agent(agent_type)

        if not agent:
            raise ValueError(f"Agent not found: {agent_type}")

        # Track metrics
        metric_key = f"{workflow_id}_{agent_type.value}"
        self.agent_metrics[metric_key] = {
            "agent_type": agent_type.value,
            "task": task,
            "start_time": datetime.utcnow().isoformat(),
        }

        try:
            # Execute agent
            result = await agent.execute(task, input_data, user_id)

            # Update metrics
            self.agent_metrics[metric_key].update({
                "end_time": datetime.utcnow().isoformat(),
                "status": "success",
            })

            return result

        except Exception as e:
            # Update metrics with error
            self.agent_metrics[metric_key].update({
                "end_time": datetime.utcnow().isoformat(),
                "status": "error",
                "error": str(e),
            })

            raise
```

## Inter-Agent Communication

### Message Bus Pattern

```python
# backend/app/orchestration/message_bus.py
"""
Message bus for inter-agent communication.
"""
from typing import Dict, Any, List, Callable, Optional
from collections import defaultdict
from asyncio import Queue
import logging

logger = logging.getLogger(__name__)


class MessageBus:
    """
    Async message bus for agent communication.

    Implements publish-subscribe pattern for decoupled agent communication.
    """

    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self._message_queue: Queue = Queue()
        self._running = False

    def subscribe(
        self,
        agent_type: str,
        handler: Callable[[Dict[str, Any]], Awaitable[None]],
    ) -> None:
        """Subscribe an agent to receive messages."""
        self._subscribers[agent_type].append(handler)
        logger.info(f"Agent {agent_type} subscribed to message bus")

    async def publish(self, message: AgentMessage) -> None:
        """Publish a message to all subscribers."""
        # Direct message to specific agent
        target_agent = message.to_agent.value
        if target_agent in self._subscribers:
            for handler in self._subscribers[target_agent]:
                try:
                    await handler(message)
                except Exception as e:
                    logger.error(f"Error in message handler for {target_agent}: {e}")

        # Broadcast to all subscribers (for notifications)
        if message.message_type == "notification":
            for agent_type, handlers in self._subscribers.items():
                for handler in handlers:
                    try:
                        await handler(message)
                    except Exception as e:
                        logger.error(f"Error in notification handler for {agent_type}: {e}")

    async def start(self) -> None:
        """Start the message bus processing loop."""
        self._running = True
        logger.info("Message bus started")

    async def stop(self) -> None:
        """Stop the message bus processing loop."""
        self._running = False
        logger.info("Message bus stopped")


# Global message bus
message_bus = MessageBus()
```

## Task Routing and Agent Selection

### Dynamic Task Router

```python
# backend/app/orchestration/router.py
"""
Task routing engine for dynamic agent selection.
"""
from typing import Dict, Any, Optional, List
from app.agents.registry import agent_registry, AgentType
import logging

logger = logging.getLogger(__name__)


class TaskRouter:
    """
    Routes tasks to appropriate agents based on capabilities and context.

    Implements intelligent routing with fallback strategies and load balancing.
    """

    def __init__(self):
        self.routing_rules: Dict[str, List[AgentType]] = {
            # Direct routing rules
            "parse_intent": [AgentType.NLP_PARSER],
            "detect_language": [AgentType.NLP_PARSER],
            "translate_urdu_to_english": [AgentType.URDU_TRANSLATOR],
            "translate_english_to_urdu": [AgentType.URDU_TRANSLATOR],

            # Todo operations
            "create_task": [AgentType.TODO_CRUD],
            "list_tasks": [AgentType.TODO_CRUD],
            "update_task": [AgentType.TODO_CRUD],
            "delete_task": [AgentType.TODO_CRUD],
            "complete_task": [Agent_TYPE.TODO_CRUD],

            # Voice operations
            "transcribe_audio": [AgentType.VOICE_INPUT],

            # Multi-agent tasks
            "voice_command": [AgentType.VOICE_INPUT, AgentType.NLP_PARSER, AgentType.TODO_CRUD],
            "urdu_command": [AgentType.NLP_PARSER, AgentType.URDU_TRANSLATOR, AgentType.NLP_PARSER, AgentType.TODO_CRUD],
        }

    def route_task(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[AgentType]:
        """
        Determine which agents should handle a task.

        Args:
            task: Task to route
            context: Optional context for routing decisions

        Returns:
            Ordered list of agents to execute

        Example:
            route_task("voice_command", {"language": "ur"})
            # Returns: [VOICE_INPUT, NLP_PARSER, TODO_CRUD]
        """
        # Direct routing
        if task in self.routing_rules:
            agents = self.routing_rules[task]

            # Apply context-based filtering
            if context:
                # If language is Urdu, insert translator
                if context.get("language") == "ur" and task == "parse_intent":
                    return [AgentType.NLP_PARSER, AgentType.URDU_TRANSLATOR]

            return agents

        # Capability-based routing
        capable_agents = agent_registry.find_agents_for_task(task)

        if capable_agents:
            return capable_agents

        # Fallback to NLP parser for unknown tasks
        logger.warning(f"No specific agent for task '{task}', routing to NLP parser")
        return [AgentType.NLP_PARSER]

    async def execute_task(
        self,
        task: str,
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Execute a task by routing to appropriate agents.

        Args:
            task: Task to execute
            input_data: Task input data
            user_id: User ID for scoping

        Returns:
            Task execution result
        """
        # Determine which agents should handle this task
        agents = self.route_task(task, input_data)

        logger.info(f"Routing task '{task}' to agents: {[a.value for a in agents]}")

        # Execute agents in sequence (can be parallel for independent agents)
        result = input_data

        for agent_type in agents:
            agent = agent_registry.get_agent(agent_type)

            if agent:
                try:
                    result = await agent.execute(task, result, user_id)
                except Exception as e:
                    logger.error(f"Agent {agent_type.value} failed: {e}")
                    result = {"error": str(e), "failed_agent": agent_type.value}
                    break  # Stop on error

        return result
```

## Agent Composition Patterns

### Sequential Composition

```python
# backend/app/orchestration/composition.py
"""
Agent composition patterns for complex workflows.
"""
from typing import Dict, Any, List, Callable, Awaitable
import logging

logger = logging.getLogger(__name__)


class AgentComposer:
    """
    Composes multiple agents into complex workflows.

    Implements sequential, parallel, and conditional composition patterns.
    """

    async def sequential(
        self,
        workflow_id: str,
        agents: List[AgentType],
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Execute agents sequentially, passing output of one as input to next.

        Args:
            workflow_id: Workflow execution ID
            agents: Ordered list of agents to execute
            input_data: Initial input data
            user_id: User ID for scoping

        Example:
            await composer.sequential(
                workflow_id="wf_123",
                agents=[AgentType.VOICE_INPUT, AgentType.NLP_PARSER, AgentType.TODO_CRUD],
                input_data={"audio_bytes": b"..."},
                user_id="user-123"
            )
        """
        result = input_data

        for i, agent_type in enumerate(agents):
            agent = agent_registry.get_agent(agent_type)

            if not agent:
                raise ValueError(f"Agent not found: {agent_type}")

            logger.info(f"Sequential step {i+1}/{len(agents)}: {agent_type.value}")

            result = await agent.execute(
                task=agent_type.value,
                input_data=result,
                user_id=user_id,
            )

        return {
            "success": True,
            "workflow_id": workflow_id,
            "final_result": result,
            "steps_executed": len(agents),
        }

    async def parallel(
        self,
        workflow_id: str,
        agents: List[AgentType],
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Execute multiple agents in parallel and combine results.

        Useful for independent operations like gathering different data sources.

        Example:
            await composer.parallel(
                workflow_id="wf_123",
                agents=[AgentType.TODO_CRUD, AgentType.NLP_PARSER],
                input_data={"task": "list", "text": "show tasks"},
                user_id="user-123"
            )
        """
        import asyncio

        tasks = []
        for agent_type in agents:
            agent = agent_registry.get_agent(agent_type)

            if agent:
                tasks.append(
                    agent.execute(
                        task=agent_type.value,
                        input_data=input_data,
                        user_id=user_id,
                    )
                )

        # Execute all agents in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            "success": True,
            "workflow_id": workflow_id,
            "results": [
                {
                    "agent": agent.value,
                    "result": result if not isinstance(result, Exception) else {"error": str(result)},
                }
                for agent, result in zip(agents, results)
            ],
        }

    async def conditional(
        self,
        condition: Callable[[Dict[str, Any]], bool],
        true_branch: List[AgentType],
        false_branch: List[AgentType],
        workflow_id: str,
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Route to different agent chains based on condition.

        Example:
            await composer.conditional(
                condition=lambda data: data.get("language") == "ur",
                true_branch=[AgentType.URDU_TRANSLATOR, AgentType.NLP_PARSER],
                false_branch=[AgentType.NLP_PARSER],
                workflow_id="wf_123",
                input_data={"text": "مجھے کام شامل کریں"},
                user_id="user-123"
            )
        """
        agents = true_branch if condition(input_data) else false_branch

        return await self.sequential(
            workflow_id=workflow_id,
            agents=agents,
            input_data=input_data,
            user_id=user_id,
        )
```

## Error Handling and Fault Tolerance

### Circuit Breaker Pattern

```python
# backend/app/orchestration/circuit_breaker.py
"""
Circuit breaker pattern for fault-tolerant agent execution.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CircuitBreaker:
    """
    Circuit breaker to prevent cascading failures.

    Opens circuit after threshold failures, closes after timeout.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        timeout_seconds: int = 60,
        half_open_attempts: int = 3,
    ):
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.half_open_attempts = half_open_attempts

        self.state = "closed"  # closed, open, half_open
        self.failures = 0
        self.last_failure_time: Optional[datetime] = None
        self.half_open_success_count = 0

    def can_execute(self) -> bool:
        """Check if execution is allowed based on circuit state."""
        if self.state == "closed":
            return True

        if self.state == "open":
            # Check if timeout has passed
            if self.last_failure_time:
                time_since_failure = (datetime.utcnow() - self.last_failure_time).total_seconds()
                if time_since_failure > self.timeout_seconds:
                    self.state = "half_open"
                    logger.info("Circuit breaker entering half-open state")
                    return True
            return False

        if self.state == "half_open":
            return self.half_open_attempts > 0

        return False

    def record_success(self) -> None:
        """Record successful execution."""
        if self.state == "half_open":
            self.half_open_success_count += 1
            if self.half_open_success_count >= self.half_open_attempts:
                self.state = "closed"
                self.failures = 0
                self.half_open_success_count = 0
                logger.info("Circuit breaker closed after successful recovery")

    def record_failure(self) -> None:
        """Record failed execution."""
        self.failures += 1
        self.last_failure_time = datetime.utcnow()

        if self.failures >= self.failure_threshold:
            self.state = "open"
            logger.warning(f"Circuit breaker opened after {self.failures} failures")


class FaultTolerantOrchestrator:
    """
    Orchestrator with fault tolerance and retry logic.
    """

    def __init__(self):
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.retry_config: Dict[str, Dict[str, int]] = {
            "max_retries": 3,
            "retry_delay_ms": 1000,
        }

    async def execute_with_retry(
        self,
        agent_type: str,
        task: str,
        input_data: Dict[str, Any],
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Execute agent with circuit breaker and retry logic.
        """
        from app.agents.registry import agent_registry

        # Get or create circuit breaker for this agent
        if agent_type not in self.circuit_breakers:
            self.circuit_breakers[agent_type] = CircuitBreaker()

        circuit_breaker = self.circuit_breakers[agent_type]

        # Check if execution is allowed
        if not circuit_breaker.can_execute():
            logger.warning(f"Circuit breaker open for agent {agent_type}")
            return {"error": "Circuit breaker open", "agent": agent_type}

        # Execute with retries
        max_retries = self.retry_config.get("max_retries", 3)
        retry_delay = self.retry_config.get("retry_delay_ms", 1000)

        for attempt in range(max_retries + 1):
            try:
                agent = agent_registry.get_agent(agent_type)

                if not agent:
                    return {"error": f"Agent not found: {agent_type}"}

                result = await agent.execute(task, input_data, user_id)

                # Success - record and return
                circuit_breaker.record_success()
                return result

            except Exception as e:
                if attempt == max_retries:
                    # Final attempt failed
                    circuit_breaker.record_failure()
                    logger.error(f"All {max_retries} attempts failed for agent {agent_type}: {e}")
                    return {
                        "error": str(e),
                        "agent": agent_type,
                        "attempts": attempt + 1,
                    }

                # Retry after delay
                logger.warning(f"Attempt {attempt + 1} failed for {agent_type}, retrying in {retry_delay}ms")
                await asyncio.sleep(retry_delay / 1000)

        return None
```

## Monitoring and Observability

### Agent Metrics Collector

```python
# backend/app/orchestration/monitoring.py
"""
Monitoring and metrics collection for multi-agent systems.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AgentMetricsCollector:
    """
    Collects and aggregates metrics from agent executions.
    """

    def __init__(self):
        self.execution_history: List[Dict[str, Any]] = []
        self.agent_performance: Dict[str, Dict[str, Any]] = {}

    def record_execution(
        self,
        workflow_id: str,
        agent_type: str,
        task: str,
        duration_ms: float,
        status: str,
        error: Optional[str] = None,
    ) -> None:
        """Record a single agent execution."""
        record = {
            "workflow_id": workflow_id,
            "agent_type": agent_type,
            "task": task,
            "duration_ms": duration_ms,
            "status": status,
            "error": error,
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.execution_history.append(record)

        # Update performance stats
        if agent_type not in self.agent_performance:
            self.agent_performance[agent_type] = {
                "total_executions": 0,
                "successful": 0,
                "failed": 0,
                "avg_duration_ms": 0,
            }

        perf = self.agent_performance[agent_type]
        perf["total_executions"] += 1

        if status == "success":
            perf["successful"] += 1
        else:
            perf["failed"] += 1

        # Update average duration
        total_duration = perf["avg_duration_ms"] * (perf["total_executions"] - 1)
        perf["avg_duration_ms"] = (total_duration + duration_ms) / perf["total_executions"]

    def get_agent_performance_summary(
        self,
        agent_type: Optional[str] = None,
        time_window_minutes: int = 60,
    ) -> Dict[str, Any]:
        """Get performance summary for an agent or all agents."""
        cutoff_time = datetime.utcnow() - timedelta(minutes=time_window_minutes)

        recent_executions = [
            record for record in self.execution_history
            if datetime.fromisoformat(record["timestamp"]) >= cutoff_time
        ]

        if agent_type:
            recent_executions = [
                r for r in recent_executions
                if r["agent_type"] == agent_type
            ]

        return {
            "agent_type": agent_type or "all",
            "time_window_minutes": time_window_minutes,
            "total_executions": len(recent_executions),
            "successful_executions": len([r for r in recent_executions if r["status"] == "success"]),
            "failed_executions": len([r for r in recent_executions if r["status"] == "error"]),
            "success_rate": (
                len([r for r in recent_executions if r["status"] == "success"]) / len(recent_executions)
                if recent_executions else 0
            ),
        }

    def get_slowest_agents(
        self,
        time_window_minutes: int = 60,
        top_n: int = 5,
    ) -> List[Dict[str, Any]]:
        """Identify slowest agents for optimization."""
        summary = self.get_agent_performance_summary(time_window_minutes=time_window_minutes)

        agent_stats = []
        for agent, perf in self.agent_performance.items():
            if perf["total_executions"] > 0:
                agent_stats.append({
                    "agent": agent,
                    "avg_duration_ms": perf["avg_duration_ms"],
                    "total_executions": perf["total_executions"],
                    "success_rate": perf["successful"] / perf["total_executions"],
                })

        # Sort by average duration (slowest first)
        agent_stats.sort(key=lambda x: x["avg_duration_ms"], reverse=True)

        return agent_stats[:top_n]


# Global metrics collector
metrics_collector = AgentMetricsCollector()
```

## FastAPI Integration

### Orchestration Endpoint

```python
# backend/app/api/routes/orchestration.py
"""FastAPI routes for multi-agent orchestration."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.api.deps import get_current_user
from app.orchestration.engine import OrchestrationEngine
from app.orchestration.monitoring import metrics_collector

router = APIRouter(prefix="/api/orchestration", tags=["orchestration"])


class OrchestrationRequest(BaseModel):
    """Request schema for agent orchestration."""
    request: str = Field(..., min_length=1, max_length=500, description="Natural language request")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    streaming: bool = Field(False, description="Enable streaming responses")


class OrchestrationResponse(BaseModel):
    """Response schema for orchestration results."""
    success: bool
    workflow_id: str
    response: str
    agent_chain: list[str]
    execution_time: float
    language: str
    agent_metrics: Optional[Dict[str, Any]] = None


@router.post("/execute", response_model=OrchestrationResponse)
async def orchestrate_agents(
    request: OrchestrationRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Execute multi-agent orchestration for user request.

    - **request**: Natural language request (e.g., "Add a task with voice input")
    - **context**: Optional context for routing decisions
    - **streaming**: Enable streaming responses (default: false)

    Returns:
        Orchestration result with agent chain and metrics

    Example:
        POST /api/orchestration/execute
        {
            "request": "Add a high priority task for shopping",
            "context": {"input_mode": "voice"}
        }
    """
    orchestrator = OrchestrationEngine()

    result = await orchestrator.orchestrate_request(
        user_request=request.request,
        user_id=user_id,
        context=request.context,
    )

    # Add metrics
    result["agent_metrics"] = metrics_collector.get_agent_performance_summary()

    return OrchestrationResponse(**result)


@router.get("/metrics")
async def get_orchestration_metrics(
    time_window_minutes: int = 60,
    user_id: str = Depends(get_current_user),
):
    """
    Get orchestration metrics and agent performance.

    - **time_window_minutes**: Time window for metrics (default: 60)

    Returns:
        Agent performance metrics and execution history
    """
    return metrics_collector.get_agent_performance_summary(
        time_window_minutes=time_window_minutes
    )
```

## Configuration and Testing

### Environment Configuration

```bash
# backend/.env (add to existing)

# Agent Orchestration
ENABLE_MULTI_AGENT=true
ORCHESTRATION_TIMEOUT_SECONDS=30
AGENT_MAX_RETRIES=3
CIRCUIT_BREAKER_THRESHOLD=5
METRICS_RETENTION_DAYS=7
```

### Testing Multi-Agent Workflows

```python
# backend/tests/test_multi_agent_orchestration.py
"""Test multi-agent orchestration."""

@pytest.mark.asyncio
async def test_voice_command_workflow():
    """Test complete voice command workflow."""
    from app.orchestration.engine import OrchestrationEngine

    orchestrator = OrchestrationEngine()

    result = await orchestrator.orchestrate_request(
        user_request="Add a task called buy groceries with high priority",
        user_id="test-user-123",
        context={"input_mode": "voice"},
    )

    assert result["success"] is True
    assert "nlp_parser" in result["agent_chain"] or "todo_crud" in result["agent_chain"]
    assert result["response"] is not None


@pytest.mark.asyncio
async def test_urdu_command_translation_workflow():
    """Test Urdu command translation workflow."""
    from app.orchestration.engine import OrchestrationEngine

    orchestrator = OrchestrationEngine()

    result = await orchestrator.orchestrate_request(
        user_request="مجھے خریداری کے لیے کام شامل کریں",
        user_id="test-user-123",
        context={},
    )

    assert result["success"] is True
    assert result["language"] == "ur"
    assert "urdu_translator" in result["agent_chain"]


@pytest.mark.asyncio
async def test_agent_error_recovery():
    """Test fault tolerance with circuit breaker."""
    from app.orchestration.fault_tolerant_orchestrator import FaultTolerantOrchestrator

    orchestrator = FaultTolerantOrchestrator()

    # Test retry logic would go here
    # This is a simplified example
    result = await orchestrator.execute_with_retry(
        agent_type="todo_crud",
        task="create_task",
        input_data={"title": "Test task"},
        user_id="test-user-123",
    )

    assert result is not None
    assert "success" in result or "error" in result
```

## Quality Assurance Checklist

- [ ] Agent registry created with all specialized agents registered
- [ ] Agent capabilities defined with task routing
- [ ] Orchestration engine implements coordinator-specialist pattern
- [ ] Message bus for inter-agent communication
- ] Task router with dynamic agent selection
- ] Sequential and parallel agent composition patterns
- ] Conditional routing based on context
- ] Circuit breaker pattern for fault tolerance
- ] Retry logic with exponential backoff
- ] Metrics collection for all agent executions
- ] Performance monitoring and slow agent identification
- ] FastAPI endpoints for orchestration and metrics
- ] Unit tests for single agent workflows
- [ ] Unit tests for multi-agent chains
- [ ] Integration tests for complete workflows
- [ ] Error handling and recovery tests
- [ ] Documentation of agent capabilities and routing rules

## References and Further Reading

- [OpenAI Multi-Agent Portfolio Collaboration](https://developers.openai.com/cookbook/examples/agents_sdk/multi-agent-portfolio-collaboration/)
- [OpenAI Agents SDK: Orchestrating Multiple Agents](https://openai.github.io/openai-agents-python/multi_agent/)
- [Orchestrating Agents: Routines and Handoffs](https://developers.openai.com/cookbook/examples/orchestrating_agents/)
- [Build Multi-Agent Apps with OpenAI SDK](https://towardsdatascience.com/build-multi-agent-apps-with-openais-agent-sdk/)
- [Redis: AI Agent Architecture Patterns](https://redis.io/blog/ai-agent-architecture-patterns/)
- [Multi-Agent Workflows: Practical Guide](https://medium.com/@kanerika/multi-agent-workflows-a-practical-guide-to-design-tools-and-deployment-3b0a2c46e389)
- [Comet: Multi-Agent Systems Architecture](https://www.comet.com/site/blog/multi-agent-systems/)
- [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [AWS: Multi-Agent Collaboration Patterns](https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/)
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
