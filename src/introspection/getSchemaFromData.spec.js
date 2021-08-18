import {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import getSchemaFromData from './getSchemaFromData';

const data = {
    posts: [
        {
            id: 1,
            title: 'Lorem Ipsum',
            views: 254,
            user_id: 123,
        },
        {
            id: 2,
            title: 'Sic Dolor amet',
            views: 65,
            user_id: 456,
        },
    ],
    users: [
        {
            id: 123,
            name: 'John Doe',
        },
        {
            id: 456,
            name: 'Jane Doe',
        },
    ],
};

const PostType = new GraphQLObjectType({
    name: 'post',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        views: { type: new GraphQLNonNull(GraphQLInt) },
        user_id: { type: new GraphQLNonNull(GraphQLID) },
        user: { type: UserType },
    }),
});

const UserType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        posts: { type: new GraphQLList(PostType) },
    }),
});

/*
const ListMetadataType = new GraphQLObjectType({
    name: 'ListMetadata',
    fields: {
        count: { type: GraphQLInt },
    },
});

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getPost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
        },
        getPageOfPost: {
            type: new GraphQLList(PostType),
            args: {
                page: { type: GraphQLInt },
                perPage: { type: GraphQLInt },
                sortField: { type: GraphQLString },
                sortOrder: { type: GraphQLString },
                filter: { type: GraphQLString },
            },
        },
        getUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
        },
        getPageOfUser: {
            type: new GraphQLList(UserType),
            args: {
                page: { type: GraphQLInt },
                perPage: { type: GraphQLInt },
                sortField: { type: GraphQLString },
                sortOrder: { type: GraphQLString },
                filter: { type: GraphQLString },
            },
        },
    },
});
*/

test('creates one type per data type', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(typeMap['post'].name).toEqual(PostType.name);
    expect(Object.keys(typeMap['post'].getFields())).toEqual(
        Object.keys(PostType.getFields())
    );
    expect(typeMap['user'].name).toEqual(UserType.name);
    expect(Object.keys(typeMap['user'].getFields())).toEqual(
        Object.keys(UserType.getFields())
    );
});

test('creates one field per relationship', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(Object.keys(typeMap['post'].getFields())).toContain('user');
});

test('creates one field per reverse relationship', () => {
    const typeMap = getSchemaFromData(data).getTypeMap();
    expect(Object.keys(typeMap['user'].getFields())).toContain('posts');
});

test('creates three query fields per data type', () => {
    const queries = getSchemaFromData(data).getQueryType().getFields();
    expect(queries['post'].type.name).toEqual(PostType.name);
    expect(queries['post'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
    expect(queries['posts'].type.toString()).toEqual('[post]');
    expect(queries['posts'].args[0].name).toEqual('page');
    expect(queries['posts'].args[0].type).toEqual(GraphQLInt);
    expect(queries['posts'].args[1].name).toEqual('perPage');
    expect(queries['posts'].args[1].type).toEqual(GraphQLInt);
    expect(queries['posts'].args[2].name).toEqual('sortField');
    expect(queries['posts'].args[2].type).toEqual(GraphQLString);
    expect(queries['posts'].args[3].name).toEqual('sortOrder');
    expect(queries['posts'].args[3].type).toEqual(GraphQLString);
    expect(queries['posts'].args[4].name).toEqual('filter');
    expect(queries['posts'].args[4].type.toString()).toEqual('postFilter');
    expect(queries['_postsMeta'].type.toString()).toEqual('ListMetadata');

    expect(queries['user'].type.name).toEqual(UserType.name);
    expect(queries['user'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
    expect(queries['users'].type.toString()).toEqual('[user]');
    expect(queries['users'].args[0].name).toEqual('page');
    expect(queries['users'].args[0].type).toEqual(GraphQLInt);
    expect(queries['users'].args[1].name).toEqual('perPage');
    expect(queries['users'].args[1].type).toEqual(GraphQLInt);
    expect(queries['users'].args[2].name).toEqual('sortField');
    expect(queries['users'].args[2].type).toEqual(GraphQLString);
    expect(queries['users'].args[3].name).toEqual('sortOrder');
    expect(queries['users'].args[3].type).toEqual(GraphQLString);
    expect(queries['users'].args[4].name).toEqual('filter');
    expect(queries['users'].args[4].type.toString()).toEqual('userFilter');
    expect(queries['_postsMeta'].type.toString()).toEqual('ListMetadata');
});

test('creates three mutation fields per data type', () => {
    const mutations = getSchemaFromData(data).getMutationType().getFields();
    expect(mutations['postCreate'].type.name).toEqual(PostType.name);
    expect(mutations['postCreate'].args).toEqual([
        {
            name: 'title',
            type: new GraphQLNonNull(GraphQLString),
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'views',
            type: new GraphQLNonNull(GraphQLInt),
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'user_id',
            type: new GraphQLNonNull(GraphQLID),
            defaultValue: undefined,
            description: null,
        },
    ]);
    expect(mutations['postUpdate'].type.name).toEqual(PostType.name);
    expect(mutations['postUpdate'].args).toEqual([
        {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'title',
            type: GraphQLString,
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'views',
            type: GraphQLInt,
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'user_id',
            type: GraphQLID,
            defaultValue: undefined,
            description: null,
        },
    ]);
    expect(mutations['postRemove'].type.name).toEqual(PostType.name);
    expect(mutations['postRemove'].args).toEqual([
        {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
            defaultValue: undefined,
            description: null,
        },
    ]);
    expect(mutations['userCreate'].type.name).toEqual(UserType.name);
    expect(mutations['userCreate'].args).toEqual([
        {
            name: 'name',
            type: new GraphQLNonNull(GraphQLString),
            defaultValue: undefined,
            description: null,
        },
    ]);
    expect(mutations['userUpdate'].type.name).toEqual(UserType.name);
    expect(mutations['userUpdate'].args).toEqual([
        {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
            defaultValue: undefined,
            description: null,
        },
        {
            name: 'name',
            type: GraphQLString,
            defaultValue: undefined,
            description: null,
        },
    ]);
    expect(mutations['userRemove'].type.name).toEqual(UserType.name);
    expect(mutations['userRemove'].args).toEqual([
        {
            defaultValue: undefined,
            description: null,
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
        },
    ]);
});

test('pluralizes and capitalizes correctly', () => {
    const data = {
        feet: [
            { id: 1, size: 42 },
            { id: 2, size: 39 },
        ],
        categories: [{ id: 1, name: 'foo' }],
    };
    const queries = getSchemaFromData(data).getQueryType().getFields();
    expect(queries).toHaveProperty('foot');
    expect(queries).toHaveProperty('category');
    expect(queries).toHaveProperty('feet');
    expect(queries).toHaveProperty('categories');
    const types = getSchemaFromData(data).getTypeMap();
    expect(types).toHaveProperty('foot');
    expect(types).toHaveProperty('category');
});
