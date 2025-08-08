/**
 * Tipos para el sistema de documentación
 */

export interface ComponentDocumentation {
  id: string
  name: string
  description: string
  category: string
  props: PropDefinition[]
  examples: CodeExample[]
  useCases: UseCase[]
  relatedComponents: string[]
  lastUpdated: Date
  author: string
}

export interface PropDefinition {
  name: string
  type: string
  required: boolean
  defaultValue?: any
  description: string
  examples?: string[]
}

export interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  language: 'typescript' | 'javascript' | 'tsx' | 'jsx'
  preview?: React.ComponentType
  editable: boolean
}

export interface UseCase {
  id: string
  title: string
  description: string
  scenario: string
  implementation: string
}

export interface ModuleDocumentation {
  id: string
  name: string
  description: string
  architecture: ArchitectureInfo
  components: ComponentDocumentation[]
  services: ServiceDocumentation[]
  entities: EntityDocumentation[]
  examples: ModuleExample[]
  dependencies: string[]
  exports: ExportDefinition[]
}

export interface ArchitectureInfo {
  pattern: string
  layers: LayerInfo[]
  principles: string[]
  decisions: ArchitecturalDecision[]
}

export interface LayerInfo {
  name: string
  description: string
  responsibilities: string[]
  dependencies: string[]
}

export interface ArchitecturalDecision {
  id: string
  title: string
  context: string
  decision: string
  rationale: string
  consequences: string[]
  date: Date
}

export interface ServiceDocumentation {
  name: string
  description: string
  methods: MethodDocumentation[]
  dependencies: string[]
  examples: ServiceExample[]
}

export interface MethodDocumentation {
  name: string
  description: string
  parameters: ParameterInfo[]
  returnType: string
  throws: string[]
  examples: string[]
}

export interface ParameterInfo {
  name: string
  type: string
  required: boolean
  description: string
}

export interface EntityDocumentation {
  name: string
  description: string
  properties: PropertyInfo[]
  methods: MethodDocumentation[]
  relationships: RelationshipInfo[]
  businessRules: string[]
}

export interface PropertyInfo {
  name: string
  type: string
  description: string
  constraints: string[]
}

export interface RelationshipInfo {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  target: string
  description: string
}

export interface ModuleExample {
  id: string
  title: string
  description: string
  scenario: string
  code: string
  explanation: string
}

export interface ServiceExample {
  id: string
  title: string
  description: string
  code: string
  explanation: string
}

export interface ExportDefinition {
  name: string
  type: 'class' | 'interface' | 'function' | 'constant'
  description: string
  public: boolean
}

export interface APIDocumentation {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  parameters: APIParameter[]
  requestBody?: RequestBodyInfo
  responses: ResponseInfo[]
  examples: APIExample[]
  authentication?: AuthenticationInfo
}

export interface APIParameter {
  name: string
  location: 'path' | 'query' | 'header'
  type: string
  required: boolean
  description: string
  example?: any
}

export interface RequestBodyInfo {
  contentType: string
  schema: any
  description: string
  examples: any[]
}

export interface ResponseInfo {
  statusCode: number
  description: string
  schema?: any
  examples: any[]
}

export interface APIExample {
  id: string
  title: string
  description: string
  request: any
  response: any
  explanation: string
}

export interface AuthenticationInfo {
  type: 'bearer' | 'api-key' | 'basic'
  description: string
  location?: string
}

export interface InteractiveExample {
  id: string
  title: string
  description: string
  component: React.ComponentType
  props: Record<string, any>
  code: string
  editable: boolean
  playground: boolean
}

export interface Diagram {
  id: string
  title: string
  type: 'mermaid' | 'plantuml' | 'svg'
  content: string
  description: string
}

export interface DocumentationStructure {
  arquitectura: {
    vision: string
    principios: string[]
    patrones: DesignPattern[]
    diagramas: Diagram[]
  }
  modulos: ModuleDocumentation[]
  componentes: ComponentDocumentation[]
  apis: APIDocumentation[]
  guias: {
    desarrollo: DevelopmentGuide
    testing: TestingGuide
    deployment: DeploymentGuide
  }
}

export interface DesignPattern {
  name: string
  description: string
  context: string
  problem: string
  solution: string
  examples: string[]
  benefits: string[]
  drawbacks: string[]
}

export interface DevelopmentGuide {
  title: string
  sections: GuideSection[]
  prerequisites: string[]
  resources: Resource[]
}

export interface TestingGuide {
  title: string
  sections: GuideSection[]
  frameworks: string[]
  bestPractices: string[]
}

export interface DeploymentGuide {
  title: string
  sections: GuideSection[]
  environments: EnvironmentInfo[]
  procedures: DeploymentProcedure[]
}

export interface GuideSection {
  id: string
  title: string
  content: string
  codeExamples: CodeExample[]
  links: Resource[]
}

export interface Resource {
  title: string
  url: string
  description: string
  type: 'documentation' | 'tutorial' | 'reference' | 'tool'
}

export interface EnvironmentInfo {
  name: string
  description: string
  url?: string
  configuration: Record<string, any>
}

export interface DeploymentProcedure {
  name: string
  description: string
  steps: DeploymentStep[]
  rollback: DeploymentStep[]
}

export interface DeploymentStep {
  order: number
  description: string
  command?: string
  verification: string
}