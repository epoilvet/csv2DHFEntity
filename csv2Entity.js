const { prompt, Form, Toggle } = require("enquirer");
const { exec } = require("child_process");
var colors = require("colors");

var context= {}
const typeMapping = {

"any" : "string",
"year" : "number",
"integer" : "int",
"duration" : "int",
"integer" : "int"

}


function generateEntity(def,name,version,baseUri,defaultCollation){

let model = {
  "info" : {
    "title" : name,
    "version" : version,
    "baseUri" : baseUri
  },
  "definitions" : {
   
  }
}


model["definitions"][name] =  {
  "required" : [ ],
  "pii" : [ ],
  "elementRangeIndex" : [ ],
  "rangeIndex" : [ ],
  "wordLexicon" : [ ],
  "properties" : {

  }
}

def.fields.map(item => model["definitions"][name].properties[capitalize(item.name)]= {
  "datatype" : item.type,
  "collation" : defaultCollation
} )

return model
}

function capitalize(phrase) {
  return phrase
    .replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    })
    .replace(/[ ]/g, "")
    .replace(/[\/\\]/g, "_");
}

const getCSVFields = async function (csvPath, delimiter) {
    const { Table } = require("tableschema");
    const table = await Table.load(csvPath, { delimiter: delimiter });
    await table.infer();
    let desc = await table.schema.descriptor; //await table.save() // save the data
  
    desc.fields.map((f) => {
      if(typeMapping[f.type]) f.type =typeMapping[f.type];
    });
  
    return desc;
  };



  (async () => {

    const tmpContext = await prompt([
        {
          type: "input",
          name: "path",
          message: "What is the path of the CSV file ?",
          initial: context.database,
        },
        {
          type: "input",
          name: "delimiter",
          message: "What is the delimiter of the CSV file ?",
          initial: context.delimiter,
        },
        {
          type: "input",
          name: "entity",
          message: "What is the name of the entity ?",
          initial: context.entity,
        },
        {
            type: "input",
            name: "version",
            message: "Version ?",
            initial: "0.0.1",
          },
          {
            type: "input",
            name: "baseUri",
            message: "baseUri ?",
            initial: "http://default.com/",
          },
        {
            type: "input",
            name: "defaultCollation",
            message: "Default collation ?",
            initial: "http://marklogic.com/collation/codepoint",
          }
      ]);

      Object.assign(context,tmpContext)

      let def = await getCSVFields(context.path,context.delimiter)
      console.log(JSON.stringify(generateEntity(def,context.entity,context.version,context.baseUri,context.defaultCollation), null, 4))

})().catch(console.log);