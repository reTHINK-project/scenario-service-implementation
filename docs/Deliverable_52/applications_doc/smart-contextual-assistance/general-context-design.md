@startuml "smart-contexts-design.png"


	class Context0 {
	}

  class Context1 {
	}

  class Context2 {
	}

  class Context3 {
	}

  class WorkContext {
  }

  class PersonalContext {
  }

  class WellbeingContext {
  }

  class LearningContext {
  }

  class WorkProjectContext {
  }

  class WorkTaskContext {
  }

  class PeerContext {
  }

	Context0 *-- "1..*" Context1
  Context1 *-- "1..*" Context2
  Context2 *-- "1..*" Context3

	Context0 -up-|> Context.Context
	Context1 -up-|> Context.Context
	Context2 -up-|> Context.Context
	Context3 -up-|> Context.Context

  WorkContext -up-|> Context0
  PersonalContext -up-|> Context0

  WellbeingContext -up-|> Context1
  LearningContext -up-|> Context1

  WorkProjectContext -up-|> Context1
  WorkTaskContext -up-|> Context2

  PeerContext -up-|> Context1
  PeerContext -up-|> Context2
  PeerContext -up-|> Context3

@enduml
