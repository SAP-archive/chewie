const log = require('./logger');

/**
 * This function extends RAML object, dereferences $ref keys
 * @param {object} [objectRaml] - RAML object to extend
 */
function extend(objectRaml){
  const schemas = _getSchemas(objectRaml);
  if(!schemas)
    return objectRaml;
  const resolve = _refsResolver(schemas);
  resolve(objectRaml);
}

/**
 * This function search strings in RAML object and resolvs them
 * @param {object} [object] - object contains schemas from raml
 */
function _refsResolver(schemas){

  return function _resolveRefs(object){
    if(!object) return;

    if(Array.isArray(object)){
      object.forEach((item) => _resolveRefs(item));
    }

    if(typeof object === 'object'){
      Object.keys(object).forEach((key) => {

        const value = object[key];
        if(typeof value !== 'string')
          return _resolveRefs(object[key]);
        
        object[key] = _getResolvedString(value, schemas); 
      });
    }
  };

}

/**
 * This function return resolved string with dereferenced $ref
 * @param {string} [string] - string to resolve
 * @param {object} [schemas] - object contains schemas from raml
 * @returns resolved string with dereferenced $ref
 */
function _getResolvedString(string, schemas){
  try {
    const object = JSON.parse(string);
    const extendObject = _objectExtender(schemas);
    extendObject(object);
    return JSON.stringify(object, null, 4);
  }
  catch(err){
    return string;
  }
}

/**
 * This function replace key $ref in object to proper value from schemas
 * @param {object} [schemas] - object contains schemas from raml
 */
function _objectExtender(schemas){

  return function _extendObject(object){

    if(!object) return;

    Object.keys(object).forEach((key) => {
      const value = object[key];

      if(typeof value === 'object')
        return _extendObject(value);

      if(key === '$ref'){
        const refName = value;
        const schema = schemas[refName];
        if(!schema)
          return;

        delete object[key];
        Object.assign(object, schema);
      }
    });
  };

}

/**
 * This function return schemas from RAML
 * @param {object} [objectRaml] - RAML object
 * @returns {object} - in form { schemaName: schemaObject }
 */
function _getSchemas(objectRaml){
  if(!objectRaml || !Array.isArray(objectRaml.schemas) || !objectRaml.schemas.length)
    return null;

  const schemas = objectRaml.schemas.reduce((result, schema) => {
    Object.keys(schema).forEach((key) => result[key] = JSON.parse(schema[key]));
    return result;
  }, {});

  return schemas;
}

const ramlExtender = {
  extend
};

module.exports = ramlExtender;