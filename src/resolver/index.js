import { pluralize } from 'inflection';
import GraphQLJSON from 'graphql-type-json';

import all from './Query/all';
import meta from './Query/meta';
import single from './Query/single';
import create from './Mutation/create';
import createMany from './Mutation/createMany';
import update from './Mutation/update';
import remove from './Mutation/remove';
import entityResolver from './Entity';
import { getTypeFromKey } from '../nameConverter';
import DateType from '../introspection/DateType';
import hasType from '../introspection/hasType';

const getQueryResolvers = (entityName, data) => ({
    [`${pluralize(entityName)}`]: all(data),
    [`_${pluralize(entityName)}Meta`]: meta(data),
    [entityName]: single(data),
});

const getMutationResolvers = (entityName, data) => ({
    [`${entityName}Create`]: create(data),
    [`${entityName}CreateMany`]: createMany(data),
    [`${entityName}Update`]: update(data),
    [`${entityName}Remove`]: remove(data),
});

export default (data) => {
    return Object.assign(
        {},
        {
            Query: Object.keys(data).reduce(
                (resolvers, key) =>
                    Object.assign(
                        {},
                        resolvers,
                        getQueryResolvers(getTypeFromKey(key), data[key])
                    ),
                {}
            ),
            Mutation: Object.keys(data).reduce(
                (resolvers, key) =>
                    Object.assign(
                        {},
                        resolvers,
                        getMutationResolvers(getTypeFromKey(key), data[key])
                    ),
                {}
            ),
        },
        Object.keys(data).reduce(
            (resolvers, key) =>
                Object.assign({}, resolvers, {
                    [getTypeFromKey(key)]: entityResolver(key, data),
                }),
            {}
        ),
        hasType('Date', data) ? { Date: DateType } : {}, // required because makeExecutableSchema strips resolvers from typeDefs
        hasType('JSON', data) ? { JSON: GraphQLJSON } : {} // required because makeExecutableSchema strips resolvers from typeDefs
    );
};
