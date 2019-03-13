const Schema = require('./schema');
const store = require('./store');
const path = require('path');
const _ = require('lodash');
const template = require('./template');

/**
 * 获取导出的所有的 fields （包含 default 参数）
 *
 * @param  {Object} fields  传入的 fields
 * @param  {Obejct} templateConf    模版的配置
 * @return {Object}         输出的 fields
 */
async function extendsDefaultFields (fields = {}, templateConf = {}) {
    let defaultFields = {};
    let schema = store.get('schema') || await Schema.getSchema(templateConf)

    Object.keys(schema).forEach((key) => (defaultFields[key] = schema[key].default))

    /* eslint-disable fecs-use-computed-property */
    defaultFields.name = fields.name || 'ivue-cli'
    defaultFields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', defaultFields.name);

    return _.merge({}, defaultFields, fields);
}


/**
 * 获取元 Schema - 涉及模版下载的 Schema
 *
 * @return {Promise<*>}   Meta Schema
 */
exports.getMetaSchema = async function () {
    return store.get('metaSchema') || await Schema.getMetaSchema();
}

/**
 * 通过指定的 meta 参数下载模版，下载成功后返回模板的 Schema 信息
 *
 * @param {Object} metaParams 导出参数
 * @return {*} 下载的临时路径 或者 报错对象
 */
exports.download = async function (metaParams = {}) {
    metaParams = await extendsDefaultFields(metaParams);

    return await template.download(metaParams);
}

/**
 * 获取 Schema - 涉及模版渲染的 Schema
 *
 * @param {Object} templateConf 模版自己的配置
 * @return {Promise<*>}   Schema
 */
exports.getSchema = async function (templateConf = {}) {
    if (!templateConf) {
        // 如果实在没有提前下载模板，就现用默认的参数下载一个
        templateConf = await Schema.download();
    }
    return Schema.getSchema(templateConf);
}