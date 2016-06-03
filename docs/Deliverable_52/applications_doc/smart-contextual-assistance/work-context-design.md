@startuml "work-context-design.png"

  class WorkContext {
  }

  class WorkProjectContext {
  }

  class WorkTaskContext {
  }

  class PeerContext {
  }

  WorkContext -|> Context0

	WorkContext *-down- "0..*" WorkProjectContext
	WorkProjectContext *-down- "0..*" WorkTaskContext


  WorkProjectContext -|> Context1
  WorkTaskContext -|> Context2

	WorkTaskContext *-- "1..*" PeerContext
	WorkProjectContext *-- "1..*" PeerContext
	WorkContext *-- "1..*" PeerContext

	PeerContext -|> Context.Context

@enduml
