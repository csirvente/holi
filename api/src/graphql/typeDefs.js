const typeDefs = `
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  type Subscription {
    graphTagCreated: GraphTag
    graphTagDeleted: GraphTag
    graphTagUpdated: GraphTag
  }

  type Query {
    persons(search: String): [Person]
    person(
      email: String
      nodeId: ID
    ): Person
    tags(search: String): [Tag]
    tag(nodeId: ID!): Tag
    contents(search: String): [Content]
    content(url: String!): [Content]
  }

  type Mutation {
    createTag(title: String!): Tag

    createViewer: Person
    updateTag(
      nodeId: ID!
      title: String!
      ownerEmail: String!
      description: String
      contentUrl: String
    ): Tag

    updateViewerName(name: String!): Person
    softDeleteTag(nodeId: ID!): Tag

    addTagRelatesToTags(
      from: _TagInput!
      to: _TagInput!
    ): _TagRelatesToTagsPayload

    removeTagRelatesToTags(
      from: _TagInput!
      to: _TagInput!
    ): _TagRelatesToTagsPayload

    createContent(
      title: String
      url: String!
    ): Content
    updateContent(
      url: String!
      title: String!
    ): Content
    softDeleteContent(url: String!): Content
    addGraphTagIsLinked(
      from: _GraphTagInput!
      to: _ContentInput!
    ): _GraphTagIsLinkedPayload
    removeGraphTagIsLinked(
      from: _GraphTagInput!
      to: _ContentInput!
    ): _GraphTagIsLinkedPayload
  }

  type Person {
    nodeId: ID!
    name: String
    email: String!
    created: String
    ownsTags: [Tag]
  }

  interface GraphTag {
    nodeId: ID!
    title: String!
    description: String
    contentUrl: String
    created: String
    deleted: String
    owner: Person
    relatesToTags: [Tag]
    tagsThatRelateToThis: [Tag]
    contentLinks: [Content]
  }

  type Tag implements GraphTag {
    nodeId: ID!
    title: String!
    description: String
    contentUrl: String
    created: String
    deleted: String
    owner: Person
    relatesToTags: [Tag]
    tagsThatRelateToThis: [Tag]
    contentLinks: [Content]
  }

  type Content {
    nodeId: ID!
    url: String!
    title: String
    isLinkFor: [GraphTag]
    created: String
    deleted: String
  }

  input _TagInput {
    nodeId: ID!
  }

  input _GraphTagInput {
    nodeId: ID!
  }

  input _ContentInput {
    url: String!
    title: String
  }

  type _TagRelatesToTagsPayload {
    from: Tag
    to: Tag
  }

  type _GraphTagIsLinkedPayload {
    from: GraphTag
    to: Content
  }
`;

export default typeDefs;
