const tab = '\t'
const nl = '\n'
//从 create 语句中 得到表明
function getTableNameFromSql(sql) {
	const tableName = sql.split('`')[1]
	const className = toBigCamel(tableName)
	return {
		tableName,
		className,
		beginLine: `public class ${className} implements Serializable {${nl}${tab}private static final long serialVersionUID = 1L;`,
		endLine: `}`
	}
}
function getPrimaryKey(sql) {
	const keyLine = sql.split('\n').map(l => l.trim()).filter(l => l.startsWith('PRIMARY KEY'))
	if (keyLine.length > 0) {
		return keyLine[0].substring(keyLine[0].indexOf('(') + 1, keyLine[0].indexOf(')')).split(',').map(f => f.replace(/`/, ''))
	}
	return []
}
function getFields(sql) {
	const lines = sql.split('\n').map(l => l.trim()).filter(ll => ll.startsWith('`'))
	return lines.map(l => {
		const fieldName = getFieldNameFromLine(l)
		const propName = toSmallCamel(fieldName)
		const bigCamelName = toBigCamel(fieldName)
		const myType = getFieldTypeFromLine(l)
		const javaType = getJavaType(myType)
		const comment = getCommentFromLine(l);
		return {
			name: fieldName,
			prop: propName,
			type: myType,
			javaType,
			comment,
			commentLine: comment != '' ? `${tab}/**${nl}${tab} * ${comment}${nl}${tab} */` : '',
			propLine: `${tab}private ${javaType} ${propName};`,
			getter: `${tab}public ${javaType} get${bigCamelName}() {${nl}${tab}${tab}return this.${propName};${nl}${tab}}`,
			setter: `${tab}public void set${bigCamelName}(${javaType} ${propName}) {${nl}${tab}${tab}this.${propName} = ${propName};${nl}${tab}}`
		}
	})
}
function getFieldNameFromLine(line) {
	return line.split('`')[1]
}
function getFieldTypeFromLine(line) {
	return line.split(' ')[1].split('(')[0]
}
function getCommentFromLine(line) {
	if (line.includes('COMMENT')) {
		return line.split('COMMENT')[1].split("'")[1]
	}
	return ''
}
function toSmallCamel(str) {
	const ps = str.split('_')
	if (ps.length > 1) {
		return [ps[0].toLowerCase(), ...ps.slice(1).map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase())].join('')
	}
	return ps[0].toLowerCase()
}
function toBigCamel(str) {
	const ps = str.split('_')
	if (ps.length > 1) {
		return ps.map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()).join('')
	}
	return ps[0].charAt(0).toUpperCase() + ps[0].slice(1).toLowerCase()
}
const Imports = {
	'LocalDateTime': 'import java.time.LocalDateTime;',
	'LocalDate': 'import java.time.LocalDate;',
	'LocalTime': 'import java.time.LocalTime;',
	'BigDecimal': 'import java.math.BigDecimal;'
}
const MyJavaMap = {
	'DATETIME': 'LocalDateTime',
	'DATE': 'LocalDate',
	'TIME': 'LocalTime',
	'INT': 'Integer',
	'DOUBLE': 'Double',
	'BIT': 'Boolean',
	'TINYINT': 'Integer',
	'SMALLINT': 'Integer',
	'MEDIUMINT': 'Integer',
	'BIGINT': 'Long',
	'SET': 'String',
	'VARCHAR': 'String',
	'ENUM': 'String',
	'FLOAT': 'Float',
	'CHAR': 'String',
	'TEXT': 'String',
	'JSON': 'String',
	'DECIMAL': 'BigDecimal',
}
function genImports(fields) {
	const imps = []
	fields.forEach(f => {
		if (Imports[f.javaType] && !imps.includes(Imports[f.javaType])) {
			imps.push(Imports[f.javaType])
		}
	})
	return imps
}
function getJavaType(myType) {
	return MyJavaMap[myType] ? MyJavaMap[myType] : '--'
}
function genClassCode(sql) {

	const fields = getFields(sql)
	const importLines = genImports(fields)
	const tableName = getTableNameFromSql(sql)
	const lines = ['', 'import java.io.Serializable;', ...importLines, '']
	lines.push(tableName.beginLine)
	fields.forEach(f => {
		lines.push('')
		lines.push(f.commentLine)
		lines.push(f.propLine)
	})
	fields.forEach(f => {
		lines.push('')
		lines.push(f.setter)
		lines.push('')
		lines.push(f.getter)
	})
	lines.push(tableName.endLine)
	lines.push('')
	return lines.join(`${nl}`)
}

export default genClassCode