const typeDefs = `
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  type Subscription {
    realityCreated: Reality
    realityDeleted: Reality
    realityUpdated: Reality
  }

  type Query {
    persons(search: String): [Person]
    person(
      email: String
      nodeId: ID
    ): Person
    tags(search: String): [Tag]
    tag(nodeId: ID!): Tag
    responsibilities(fulfillsTagId: ID, search: String): [Responsibility]
    responsibility(nodeId: ID!): Responsibility
    infos(search: String): [Info]
    info(url: String!): [Info]
  }

  type Mutation {
    createTag(title: String!): Tag
    createResponsibility(
      title: String!
      tagId: ID!
    ): Responsibility 
    createViewer: Person
    updateTag(
      nodeId: ID!
      title: String!
      guideEmail: String!
      realizerEmail: String
      description: String
      deliberationLink: String
    ): Tag
    updateResponsibility(
      nodeId: ID!
      title: String!
      guideEmail: String!
      realizerEmail: String
      description: String
      deliberationLink: String
    ): Responsibility
    updateViewerName(name: String!): Person
    softDeleteTag(nodeId: ID!): Tag
    softDeleteResponsibility(nodeId: ID!): Responsibility
    addTagRelatesToTags(
      from: _TagInput!
      to: _TagInput!
    ): _TagRelatesToTagsPayload
    addTagRelatesToResponsibilities(
      from: _TagInput!
      to: _ResponsibilityInput!
    ): _TagRelatesToResponsibilitiesPayload
    addResponsibilityRelatesToTags(
      from: _ResponsibilityInput!
      to: _TagInput!
    ): _ResponsibilityRelatesToTagsPayload
    addResponsibilityRelatesToResponsibilities(
      from: _ResponsibilityInput!
      to: _ResponsibilityInput!
    ): _ResponsibilityRelatesToResponsibilitiesPayload
    removeTagRelatesToTags(
      from: _TagInput!
      to: _TagInput!
    ): _TagRelatesToTagsPayload
    removeTagRelatesToResponsibilities(
      from: _TagInput!
      to: _ResponsibilityInput!
    ): _TagRelatesToResponsibilitiesPayload
    removeResponsibilityRelatesToTags(
      from: _ResponsibilityInput!
      to: _TagInput!
    ): _ResponsibilityRelatesToTagsPayload
    removeResponsibilityRelatesToResponsibilities(
      from: _ResponsibilityInput!
      to: _ResponsibilityInput!
    ): _ResponsibilityRelatesToResponsibilitiesPayload
    createInfo(
      title: String
      url: String!
    ): Info
    updateInfo(
      url: String!
      title: String!
    ): Info
    softDeleteInfo(url: String!): Info
    addRealityHasDeliberation(
      from: _RealityInput!
      to: _InfoInput!
    ): _RealityHasDeliberationPayload
    removeRealityHasDeliberation(
      from: _RealityInput!
      to: _InfoInput!
    ): _RealityHasDeliberationPayload
  }

  type Person {
    nodeId: ID!
    name: String
    email: String!
    created: String
    guidesTags: [Tag]
    realizesTags: [Tag]
    guidesResponsibilities: [Responsibility]
    realizesResponsibilities: [Responsibility]
  }

  interface Reality {
    nodeId: ID!
    title: String!
    description: String
    deliberationLink: String
    created: String
    deleted: String
    guide: Person
    realizer: Person
    relatesToTags: [Tag]
    relatesToResponsibilities: [Responsibility]
    tagsThatRelateToThis: [Tag]
    responsibilitiesThatRelateToThis: [Responsibility]
    deliberations: [Info]
  }

  type Tag implements Reality {
    nodeId: ID!
    title: String!
    description: String
    deliberationLink: String
    created: String
    deleted: String
    guide: Person
    realizer: Person
    fulfilledBy: [Responsibility]
    relatesToTags: [Tag]
    relatesToResponsibilities: [Responsibility]
    tagsThatRelateToThis: [Tag]
    responsibilitiesThatRelateToThis: [Responsibility]
    deliberations: [Info]
  }

  type Responsibility implements Reality {
    nodeId: ID!
    title: String!
    description: String
    deliberationLink: String
    created: String
    deleted: String
    guide: Person
    realizer: Person
    fulfills: Tag
    relatesToTags: [Tag]
    relatesToResponsibilities: [Responsibility]
    tagsThatRelateToThis: [Tag]
    responsibilitiesThatRelateToThis: [Responsibility]
    deliberations: [Info]
  }

  type Info {
    nodeId: ID!
    url: String!
    title: String
    isDeliberationFor: [Reality]
    created: String
    deleted: String
  }

  input _TagInput {
    nodeId: ID!
  }

  input _ResponsibilityInput {
    nodeId: ID!
  }

  input _RealityInput {
    nodeId: ID!
  }

  input _InfoInput {
    url: String!
  }

  type _TagRelatesToTagsPayload {
    from: Tag
    to: Tag
  }

  type _TagRelatesToResponsibilitiesPayload {
    from: Tag
    to: Responsibility
  }

  type _ResponsibilityRelatesToTagsPayload {
    from: Responsibility
    to: Tag
  }

  type _ResponsibilityRelatesToResponsibilitiesPayload {
    from: Responsibility
    to: Responsibility
  }

  type _RealityHasDeliberationPayload {
    from: Reality
    to: Info
  }
`;

export default typeDefs;
