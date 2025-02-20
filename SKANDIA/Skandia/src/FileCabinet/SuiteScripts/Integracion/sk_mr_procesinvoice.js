/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAmdConfig ../excel_module/sk_sc_excel_conf.json
 */
define(["N/email", "N/file", "N/search", "N/record", "xlsx", "N/runtime"], /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 */
(email, file, search, record, XLSX, runtime) => {
  /**
   * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
   * @param {Object} inputContext
   * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Object} inputContext.ObjectRef - Object that references the input data
   * @typedef {Object} ObjectRef
   * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
   * @property {string} ObjectRef.type - Type of the record instance that contains the input data
   * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
   * @since 2015.2
   */
  let clienteid = "";
  let departamentid = "";
  let classid = "";
  let locationid = "";
  let discountid = "";
  let itemid = "";
  let contratoid = "";
  let satcode = "";
  let unitid = "";
  let invoiceid = "";
  let documentId;
  let folderId;
  const getInputData = (inputContext) => {
    const contentfromget = JSON.parse(
      runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_sk_mr_idvalueinv" })
    );
    log.debug("contentfromget", contentfromget);
    documentId = contentfromget.idxls;
    folderId = contentfromget.folderselec;

    var obejson = excelFileToJson(documentId);
    var numinv = 0;
    obejson[0].forEach((element) => {
      if (element.externalid) {
        numinv++;
      }
    });
    var arreglimto = [];

    for (let i = 0; i < numinv; i++) {
      arreglimto.push({
        cabecera: {},
        lines: [],
      });
    }
    var flag1 = 0;
    obejson[0].forEach((element) => {
      if (element.externalid && flag1 < numinv) {
        arreglimto[flag1].cabecera = {
          externalid: element.externalid || null,
          customer: element.customer_externalid || null,
          trandate: element.trandate || null,
          invoicestatus: element.invoicestatus_approvalstatus || null,
          subsidiary: element.subsidiary || null,
          currency: element.currency || null,
          exchangerate: element.exchangerate || null,
          custbody_mx_cfdi_usage: element.custbody_mx_cfdi_usage || null,
          custrecord_mx_sat_et_code: element.custrecord_mx_sat_et_code || null,
          custbody_mx_txn_sat_payment_method:
            element.custbody_mx_txn_sat_payment_method || null,
          custbody_mx_txn_sat_payment_term:
            element.custbody_mx_txn_sat_payment_term || null,
          otherrefnum: element.otherrefnum || null,
          memo: element.memo || null,
          salesrep: element.salesrep || null,
          partner: element.partner || null,
          department: element.department || null,
          class: element.class || null,
          location: element.location || null,
          discount_discountitem: element.discountItem || null,
          discount_discountrate: element.discountrate || null,
        };
        arreglimto[flag1].lines.push({
          itemLine_item: element.itemLine_item || null,
          itemLine_quantity: element.itemLine_quantity || null,
          itemLine_units: element.itemLine_units || null,
          itemLine_salesPrice: element.itemLine_salesPrice || null,
          custrecord_mx_sat_to_code: element.custrecord_mx_sat_to_code || null,
          itemLine_amount: element.itemLine_amount || null,
          itemLine_description: element.itemLine_description || null,
          itemLine_department: element.itemLine_department || null,
          itemLine_class: element.itemLine_class || null,
          itemLine_location: element.itemLine_location || null,
          itemLine_custcol_skan_contrato:element.itemLine_custcol_skan_contrato || null,
          terms: element.terms || null,
          Id_externo_direccion: element.Id_externo_direccion || null,
          tobeemailed: element.tobeemailed || null,
          email: element.email || null,
          customermessage: element.customermessage || null,
        });
        flag1++;
      } else {
        var newindex = flag1 - 1;
        arreglimto[newindex].lines.push({
          itemLine_item: element.itemLine_item || null,
          itemLine_quantity: element.itemLine_quantity || null,
          itemLine_units: element.itemLine_units || null,
          itemLine_salesPrice: element.itemLine_salesPrice || null,
          custrecord_mx_sat_to_code: element.custrecord_mx_sat_to_code || null,
          itemLine_amount: element.itemLine_amount || null,
          itemLine_description: element.itemLine_description || null,
          itemLine_department: element.itemLine_department || null,
          itemLine_class: element.itemLine_class || null,
          itemLine_location: element.itemLine_location || null,
          itemLine_custcol_skan_contrato:element.itemLine_custcol_skan_contrato || null,
          terms: element.terms || null,
          Id_externo_direccion: element.Id_externo_direccion || null,
          tobeemailed: element.tobeemailed || null,
          email: element.email || null,
          customermessage: element.customermessage || null,
        });
      }
    });
    return arreglimto;
  };
  /**
   * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
   * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
   * context.
   * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
   *     is provided automatically based on the results of the getInputData stage.
   * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
   *     function on the current key-value pair
   * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
   *     pair
   * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} mapContext.key - Key to be processed during the map stage
   * @param {string} mapContext.value - Value to be processed during the map stage
   * @since 2015.2
   */

  const map = (mapContext) => {
    var datos = JSON.parse(mapContext.value);
    log.debug("campos file y document MAP", datos);

    let externalid = datos.cabecera.externalid;
    let customer = datos.cabecera.customer;
    let trandate = datos.cabecera.trandate;
    let invoicestatus = datos.cabecera.invoicestatus;
    let subsidiary = datos.cabecera.subsidiary;
    let currency = datos.cabecera.currency;
    let exchangerate = datos.cabecera.exchangerate;
    let custbody_mx_cfdi_usage = datos.cabecera.custbody_mx_cfdi_usage;
    let custrecord_mx_sat_et_code = datos.cabecera.custrecord_mx_sat_et_code;
    let custbody_mx_txn_sat_payment_method = datos.cabecera.custbody_mx_txn_sat_payment_method;
    let custbody_mx_txn_sat_payment_term = datos.cabecera.custbody_mx_txn_sat_payment_term;
    let otherrefnum = datos.cabecera.otherrefnum;
    let memo = datos.cabecera.memo;
    let salesrep = datos.cabecera.salesrep;
    let partner = datos.cabecera.partner;
    let department = datos.cabecera.department;
    let inv_class = datos.cabecera.class;
    let location = datos.cabecera.location;
    let discountItem = datos.cabecera.discount_discountitem;
    let discountrate = datos.cabecera.discount_discountrate;

    let customerParseado = customer.toString();

    if (customer && customer != "") {
      let customerSearchObj = search.create({
        type: "customer",
        filters: [["externalid", "is", customerParseado]],
        columns: [
          (search_id = search.createColumn({
            name: "internalid",
            label: "Internal ID",
          })),
        ],
      });

      var searchResultCount = customerSearchObj.runPaged().count;

      customerSearchObj.run().each(function (result) {
        clienteid = result.getValue(search_id);
        return true;
      });
    } else {
      throw "No se ha proporcionado el id externo del cliente";
    }

    //#region busqueda department
    var departmentSearchObj = search.create({
      type: "department",
      filters: [["name", "is", department]],
      columns: [
        (search_department = search.createColumn({
          name: "internalid",
          label: "Internal ID",
        })),
      ],
    });
    var searchResultCount = departmentSearchObj.runPaged().count;
    departmentSearchObj.run().each(function (result) {
      departamentid = result.getValue(search_department);
      return true;
    });

    //#endregion

    //#region busqueda clase
    var classificationSearchObj = search.create({
      type: "classification",
      filters: [["name", "is", inv_class]],
      columns: [
        (search_class = search.createColumn({
          name: "internalid",
          label: "Internal ID",
        })),
      ],
    });
    var searchResultCount = classificationSearchObj.runPaged().count;
    //                    log.debug("classificationSearchObj result count", searchResultCount);
    classificationSearchObj.run().each(function (result) {
      classid = result.getValue(search_class);
      return true;
    });
    //#endregion

    //#region busqueda ubicacion
    var locationSearchObj = search.create({
      type: "location",
      filters: [["name", "is", location]],
      columns: [
        (search_location = search.createColumn({
          name: "internalid",
          label: "Internal ID",
        })),
      ],
    });
    var searchResultCount = locationSearchObj.runPaged().count;
    //log.debug("locationSearchObj result count", searchResultCount);
    locationSearchObj.run().each(function (result) {
      locationid = result.getValue(search_location);
      return true;
    });
    //#endregion

    //#region busqueda invoice
    if (externalid != "" && externalid != null) {
      //log.debug("El campo external id dentro",externalid)
      let externalidparseado = externalid.toString();
      var transactionSearchObj = search.create({
        type: "transaction",
        filters: [
          ["recordtype", "is", "Invoice"],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["externalidstring", "is", externalidparseado],
        ],
        columns: [
          (search_invoice = search.createColumn({
            name: "internalid",
            label: "Internal ID",
          })),
        ],
      });
      var searchResultCount = transactionSearchObj.runPaged().count;
      //log.debug("transactionSearchObj result count", searchResultCount);
      if (searchResultCount > 0) {
        transactionSearchObj.run().each(function (result) {
          //log.debug("Hasta ahora funciona good")
          invoiceid = result.getValue(search_invoice);
          return true;
        });
      } else {
        invoiceid = "";
      }
    } else {
        throw "El campo externalid es obligatorio.";
    }
    //#endregion
    //log.debug('INVOICE ID', invoiceid)
    
    if (invoiceid == "") {
        var invObj = record.create({
            type: record.Type.INVOICE,
            isDynamic: true,
        });
        invObj.setValue({
          fieldId: "externalid",
          value: externalid,
        });
        
        invObj.setValue({
          fieldId: "entity",
          value: clienteid,
        });
        
        invObj.setValue({
          fieldId: "trandate",
          value: trandate,
        });
        
        invObj.setValue({
          fieldId: "approvalstatus",
          value: invoicestatus,
        });        
        invObj.setValue({
          fieldId: "subsidiary",
          value: subsidiary,
        });
        invObj.setValue({
            fieldId: "currency",
            value: currency,
          });
          invObj.setValue({
            fieldId: "exchangerate",
            value: exchangerate,
          });
          invObj.setValue({
            fieldId: "custbody_mx_cfdi_usage",
            value: custbody_mx_cfdi_usage,
          });
          invObj.setValue({
            fieldId: "custrecord_mx_sat_et_code",
            value: custrecord_mx_sat_et_code,
          });
          invObj.setValue({
            fieldId: "custbody_mx_txn_sat_payment_method",
            value: custbody_mx_txn_sat_payment_method,
          });
          
          invObj.setValue({
            fieldId: "custbody_mx_txn_sat_payment_term",
            value: custbody_mx_txn_sat_payment_term,
          });
          invObj.setValue({
            fieldId: "otherrefnum",
            value: otherrefnum,
          });
          invObj.setValue({
            fieldId: "memo",
            value: memo,
          });
          invObj.setValue({
            fieldId: "salesrep",
            value: salesrep,
          });
          invObj.setValue({
            fieldId: "partner",
            value: partner,
          });
          invObj.setValue({
            fieldId: "department",
            value: departamentid,
          });
          invObj.setValue({
            fieldId: "class",
            value: classid,
          });
          invObj.setValue({
            fieldId: "location",
            value: locationid,
          });
          invObj.setValue({
            fieldId: "discountitem",
            value: discountItem,
          });
          invObj.setValue({
            fieldId: "discountrate",
            value: discountrate,
          });





      let cliente = invObj.getValue({ fieldId: "entity" });

      datos.lines.forEach((line) => {

let itemLine_item = line.itemLine_item;
let itemLine_quantity = line.itemLine_quantity;
let itemLine_units = line.itemLine_units;
let itemLine_salesPrice = line.itemLine_salesPrice;
let custrecord_mx_sat_to_code = line.custrecord_mx_sat_to_code;
let itemLine_amount = line.itemLine_amount;
let itemLine_description = line.itemLine_description;
let itemLine_department = line.itemLine_department;
let itemLine_class = line.itemLine_class;
let itemLine_location = line.itemLine_location;
let itemLine_custcol_skan_contrato = line.itemLine_custcol_skan_contrato;
let terms = line.terms;
let Id_externo_direccion = line.Id_externo_direccion;
let tobeemailed = line.tobeemailed;
let email = line.email;
let customermessage = line.customermessage;

        let itemLine_isTaxable = line.itemLine_isTaxable;
        let itemLine_priceLevel = line.itemLine_priceLevel;

        //#region busqueda del item
        if (itemLine_item != null && itemLine_item != "") {
          var itemSearchObj = search.create({
            type: "item",
            filters: [["name", "is", line.itemLine_item]],
            columns: [
              (search_item = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = itemSearchObj.runPaged().count;
          log.debug("itemSearchObj result count", searchResultCount);
          itemSearchObj.run().each(function (result) {
            itemid = result.getValue(search_item);
            return true;
          });
          if (itemid == "") {
            throw "El artículo enviado no existe";
          }
        } else {
          throw "Debe ingresar al menos un artículo";
        }

        //#endregion

        //#region busqueda contrato
        if (itemLine_custcol_skan_contrato != null && itemLine_custcol_skan_contrato != "") {
          var customrecord_skan_contratosSearchObj = search.create({
            type: "customrecord_skan_contratos",
            filters: [["name", "is", itemLine_custcol_skan_contrato]],
            columns: [
              (search_contrato = search.createColumn({
                name: "id",
                label: "ID",
              })),
            ],
          });
          var searchResultCount =
            customrecord_skan_contratosSearchObj.runPaged().count;
          log.debug(
            "customrecord_skan_contratosSearchObj result count",
            searchResultCount
          );
          customrecord_skan_contratosSearchObj.run().each(function (result) {
            contratoid = result.getValue(search_contrato);
            return true;
          });
          if (contratoid == "") {
            throw "El contrato enviado no existe";
          }
        }
        log.debug("contratoid", contratoid);
        //#endregion

        //#region busqueda del SAT CODE
        if (custrecord_mx_sat_to_code != "" && custrecord_mx_sat_to_code != null) {
          var customrecord_mx_sat_item_codeSearchObj = search.create({
            type: "customrecord_mx_sat_item_code",
            filters: [["custrecord_mx_ic_code", "is", "84121701"]],
            columns: [
              (search_satcode = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount =
            customrecord_mx_sat_item_codeSearchObj.runPaged().count;
          log.debug(
            "customrecord_mx_sat_item_codeSearchObj result count",
            searchResultCount
          );
          customrecord_mx_sat_item_codeSearchObj.run().each(function (result) {
            satcode = result.getValue(search_satcode);
            return true;
          });
        }

        //#endregion

        //#region busqueda del tipo de unidad
        var unitstypeSearchObj = search.create({
          type: "unitstype",
          filters: [["abbreviation", "is", itemLine_units]],
          columns: [
            (search_unit = search.createColumn({
              name: "internalid",
              label: "Internal ID",
            })),
          ],
        });
        var searchResultCount = unitstypeSearchObj.runPaged().count;
        unitstypeSearchObj.run().each(function (result) {
          unitid = result.getValue(search_unit);
          return true;
        });
        if (unitid == "") {
          throw "El tipo de unidad que ha enviado no existe";
        }
        //#endregion
        invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "item",
            value: itemid,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "quantity",
            value: itemLine_quantity,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "units",
            value: unitid,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "rate",
            value: itemLine_salesPrice,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcol_mx_txn_line_sat_item_code",
            value: custrecord_mx_sat_to_code,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "amount",
            value: itemLine_amount,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "description",
            value: itemLine_description,
          })
/*           invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "department",
            value: itemLine_department,
          }) */
          /* invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "class",
            value: itemLine_class,
          }) */
          /* invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "location",
            value: itemLine_location,
          }) */
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcol_skan_contrato2",
            value: itemLine_custcol_skan_contrato,
          })


          //Billing
          invObj.setCurrentSublistValue({
            sublistId: "billing",
            fieldId: "terms",
            value: terms,
          })

          invObj.setCurrentSublistValue({
            sublistId: "bill",
            fieldId: "billaddresslist",
            value: id_externo_direccion,
          })

          //Comunication
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "tobeemailed",
            value: tobeemailed,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "email",
            value: email,
          })
          invObj.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "message",
            value: customermessage,
          })

          invObj.commitLine({
            sublistId: "item",
          });
      });
    } else {
      log.debug("actualizando dev", invoiceid);
      try {
        var invObj = record.load({
          type: record.Type.INVOICE,
          id: invoiceid,
          isDynamic: true,
        });
        invObj.setValue({
          fieldId: "entity",
          value: clienteid,
        });
        invObj.setValue({
          fieldId: "approvalstatus",
          value: invoicestatus,
        });
        invObj.setValue({
          fieldId: "trandate",
          value: trandate,
        });
        invObj.setValue({
          fieldId: "memo",
          value: memo,
        });
        invObj.setValue({
          fieldId: "salesrep",
          value: salesrep,
        });
        invObj.setValue({
          fieldId: "department",
          value: departamentid,
        });
        invObj.setValue({
          fieldId: "class",
          value: classid,
        });
        invObj.setValue({
          fieldId: "location",
          value: locationid,
        });
        invObj.setValue({
          fieldId: "discountitem",
          value: discountItem,
        });
        invObj.setValue({
          fieldId: "discountrate",
          value: discountrate,
        });
      } catch (error) {
        log.debug("Detalle en carga de cabecer", error.message);
      }

      log.debug("ITEMS LENGTH", datos.lines.length);
      let element2copy = datos.lines.slice();

      datos.lines.forEach(function (line, index) {
        log.debug("primero array posicion", index);
        let itemLine_item = line.itemLine_item;
        let itemLine_quantity = line.itemLine_quantity;
        let itemLine_units = line.itemLine_units;
        let itemLine_salesPrice = line.itemLine_salesPrice;
        let itemLine_amount = line.itemLine_amount;
        let itemLine_description = line.itemLine_description;
        let itemLine_isTaxable = line.itemLine_isTaxable;
        let itemLine_priceLevel = line.itemLine_priceLevel;
        let itemLine_department = line.itemLine_department;
        let itemLine_class = line.itemLine_class;
        let itemLine_location = line.itemLine_location;
        let itemLine_custcol_skan_contrato = line.itemLine_custcol_skan_contrato;
        let custrecord_mx_sat_to_code = "";

        //#region busqueda del item
        if (itemLine_item != null && itemLine_item != "") {
          var itemSearchObj = search.create({
            type: "item",
            filters: [["name", "is", line.itemLine_item]],
            columns: [
              (search_item = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = itemSearchObj.runPaged().count;
          itemSearchObj.run().each(function (result) {
            itemid = result.getValue(search_item);
            return true;
          });
          if (itemid == "") {
            throw "El artículo enviado no existe";
          }
        }

        //#endregion

        //#region busqueda contrato
        if (itemLine_custcol_skan_contrato != null && itemLine_custcol_skan_contrato != "") {
          var customrecord_skan_contratosSearchObj = search.create({
            type: "customrecord_skan_contratos",
            filters: [["name", "is", itemLine_custcol_skan_contrato]],
            columns: [
              (search_contrato = search.createColumn({
                name: "id",
                label: "ID",
              })),
            ],
          });
          var searchResultCount =
            customrecord_skan_contratosSearchObj.runPaged().count;
          customrecord_skan_contratosSearchObj.run().each(function (result) {
            contratoid = result.getValue(search_contrato);
            return true;
          });
          if (contratoid == "") {
            throw "El contrato enviado no existe";
          }
        }

        //#endregion

        //#region busqueda del SAT CODE
        if (custrecord_mx_sat_to_code != "" && custrecord_mx_sat_to_code != null) {
          var customrecord_mx_sat_item_codeSearchObj = search.create({
            type: "customrecord_mx_sat_item_code",
            filters: [["custrecord_mx_ic_code", "is", "84121701"]],
            columns: [
              (search_satcode = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount =
            customrecord_mx_sat_item_codeSearchObj.runPaged().count;
          log.debug(
            "customrecord_mx_sat_item_codeSearchObj result count",
            searchResultCount
          );
          customrecord_mx_sat_item_codeSearchObj.run().each(function (result) {
            satcode = result.getValue(search_satcode);
            return true;
          });
        }

        //#endregion

        //#region busqueda del tipo de unidad
        if (itemLine_units != "" && itemLine_units != null) {
          var unitstypeSearchObj = search.create({
            type: "unitstype",
            filters: [["abbreviation", "is", itemLine_units]],
            columns: [
              (search_unit = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = unitstypeSearchObj.runPaged().count;
          unitstypeSearchObj.run().each(function (result) {
            unitid = result.getValue(search_unit);
            return true;
          });
          if (unitid == "") {
            throw "El tipo de unidad que ha enviado no existe";
          }
        }

        //#endregion

        let itemcount = invObj.getLineCount({
          sublistId: "item",
        });

        if (index < itemcount) {
          invObj.selectLine({
            sublistId: "item",
            line: index,
          });
          invObj
            .setCurrentSublistValue({
              sublistId: "item",
              fieldId: "quantity",
              value: itemLine_quantity,
            })
            .setCurrentSublistValue({
              sublistId: "item",
              fieldId: "units",
              value: unitid,
            })
            .setCurrentSublistValue({
              sublistId: "item",
              fieldId: "amount",
              value: itemLine_amount,
            })
            .setCurrentSublistValue({
              sublistId: "item",
              fieldId: "",
              value: itemLine_description,
            })
            .setCurrentSublistValue({
              sublistId: "item",
              fieldId: "custcol_skan_contrato2",
              value: contratoid,
            })
            .commitLine({
              sublistId: "item",
            });
          log.debug("commit", "commit realizado");
          //element2copy.splice(index, 1);
          element2copy[index] = "";

          log.debug("arreglo copiado", element2copy);
        }
      });

      let arrItemNuevo = element2copy.filter((item) => item != "");
      log.debug("items nuevos por agregar:", arrItemNuevo);
      arrItemNuevo.forEach((line2) => {
        log.debug("arreglo 2", "AGREGANDO NUEVO ITEM");
        let itemLine_item = line2.itemLine_item;
        let itemLine_quantity = line2.itemLine_quantity;
        let itemLine_units = line2.itemLine_units;
        let itemLine_salesPrice = line2.itemLine_salesPrice;
        let itemLine_amount = line2.itemLine_amount;
        let itemLine_description = line2.itemLine_description;
        let itemLine_isTaxable = line2.itemLine_isTaxable;
        let itemLine_priceLevel = line2.itemLine_priceLevel;
        let itemLine_department = line2.itemLine_department;
        let itemLine_class = line2.itemLine_class;
        let itemLine_location = line2.itemLine_location;
        let itemLine_custcol_skan_contrato = line2.itemLine_custcol_skan_contrato;
        let custrecord_mx_sat_to_code = "";

        //#region busqueda del item
        if (itemLine_item != null && itemLine_item != "") {
          var itemSearchObj = search.create({
            type: "item",
            filters: [["name", "is", line2.itemLine_item]],
            columns: [
              (search_item = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = itemSearchObj.runPaged().count;
          itemSearchObj.run().each(function (result) {
            itemid = result.getValue(search_item);
            return true;
          });
          if (itemid == "") {
            throw "El artículo enviado no existe";
          }
        }

        //#endregion

        //#region busqueda contrato
        if (itemLine_custcol_skan_contrato != null && itemLine_custcol_skan_contrato != "") {
          var customrecord_skan_contratosSearchObj = search.create({
            type: "customrecord_skan_contratos",
            filters: [["name", "is", itemLine_custcol_skan_contrato]],
            columns: [
              (search_contrato = search.createColumn({
                name: "id",
                label: "ID",
              })),
            ],
          });
          var searchResultCount =
            customrecord_skan_contratosSearchObj.runPaged().count;
          customrecord_skan_contratosSearchObj.run().each(function (result) {
            contratoid = result.getValue(search_contrato);
            return true;
          });
          if (contratoid == "") {
            throw "El contrato enviado no existe";
          }
        }
        //#endregion

        //#region busqueda del tipo de unidad
        if (itemLine_units != "" && itemLine_units != null) {
          var unitstypeSearchObj = search.create({
            type: "unitstype",
            filters: [["abbreviation", "is", itemLine_units]],
            columns: [
              (search_unit = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = unitstypeSearchObj.runPaged().count;
          unitstypeSearchObj.run().each(function (result) {
            unitid = result.getValue(search_unit);
            return true;
          });
          if (unitid == "") {
            throw "El tipo de unidad que ha enviado no existe";
          }
        }

        //#endregion

        invObj.selectNewLine({
          sublistId: "item",
        });
        invObj
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "item",
            value: itemid,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "quantity",
            value: itemLine_quantity,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "units",
            value: unitid,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "amount",
            value: itemLine_amount,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "",
            value: itemLine_description,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "pricelevels",
            value: -1,
          })
          .setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcol_skan_contrato2",
            value: contratoid,
          })
          .commitLine({
            sublistId: "item",
          });
        log.debug("haciendo commit", "COMMIT");
      });
    }

    try {
      let idObj = invObj.save({
        ignoreMandatoryFields: true,
      });
      log.debug("id invoices credas", idObj);
    } catch (error) {
      log.debug("id invoices ERRORES", error.message);
    }
  };

  /**
   * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
   * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
   * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
   *     provided automatically based on the results of the map stage.
   * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
   *     reduce function on the current group
   * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
   * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} reduceContext.key - Key to be processed during the reduce stage
   * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
   *     for processing
   * @since 2015.2
   */
  const reduce = (reduceContext) => {
    log.debug("campos file y document reduce", folderId + documentId);
  };

  /**
   * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
   * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
   * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
   * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
   *     script
   * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
   * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
   * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
   * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
   *     script
   * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
   * @param {Object} summaryContext.inputSummary - Statistics about the input stage
   * @param {Object} summaryContext.mapSummary - Statistics about the map stage
   * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
   * @since 2015.2
   */
  const summarize = (summaryContext) => {
    const contentfromget = JSON.parse(
      runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_sk_mr_idvalueinv" })
    );
    fileId = contentfromget.idxls;
    folderId = contentfromget.folderselec;
    try {
      let fileObj = file.load({
        id: fileId,
      });
    /*folders De Recibido={
        cuentas:1526,
        nomina:1533,
        siniestros:1528,
        inversiones:1527
        } */
    /*folders A Depositar={
        cuentas:1531,
        nomina:1534,
        siniestros:1529,
        inversiones:1530
        } */
    
        if (folderId===1526){
          fileObj.folder = 1531;
      } else if(folderId===1533){
          fileObj.folder = 1534;
      }else if(folderId===1528){
          fileObj.folder = 1529;
      }else if(folderId===1527){
          fileObj.folder = 1530;                
      }
      fileObj.save();
      log.debug("SE GUARDÓ EL DOCUMENTO", fileObj.folder);
    } catch (error) {
      log.debug("Fallo en: ", error.message);
    }
  };

  //Function Area
  function excelFileToJson(fileId, headers) {
    var returnData = [];
    var excelFile = file.load({
      id: fileId,
    });

    var workbook = XLSX.read(excelFile.getContents(), { type: "base64" });
    for (var sn in workbook.SheetNames) {
      var sheet = workbook.Sheets[workbook.SheetNames[sn]];
      returnData.push(
        isEmpty(headers) || isEmpty(headers[workbook.SheetNames[sn]])
          ? XLSX.utils.sheet_to_json(sheet)
          : XLSX.utils.sheet_to_json(sheet, headers[workbook.SheetNames[sn]])
      );
    }
    return returnData;
  }

  function isEmpty(value) {
    if (value == undefined || value == null) return true;
    if (
      util.isNumber(value) ||
      util.isBoolean(value) ||
      util.isDate(value) ||
      util.isFunction(value)
    )
      return false;
    if (util.isString(value)) return value.length == 0 ? true : false;
    return Object.keys(value).length == 0 ? true : false;
  }
  function transformdate(vardate) {
    let a = vardate.slice(1, 11);
    var a1 = a.split("/");
    var fecha = new Date(a1[1] + "/" + a1[0] + "/" + a1[2]);
    return fecha;
  }

  function createJournal(arrinv) {
    var cabecera = [];
    arrinv.forEach((datos) => {
      let externalid = datos.cabecera.externalid;
      let tranId = datos.cabecera.tranId;
      let subsidiary = datos.cabecera.subsidiary;
      let currency = datos.cabecera.currency;
      let exchangerate = datos.cabecera.exchangerate;
      let postingperiod = datos.cabecera.postingperiod;
      let tranDate = transformdate(datos.cabecera.tranDate);
      let reversalDate = transformdate(datos.cabecera.reversalDate);
      let isDeferred = datos.cabecera.isDeferred == "true" ? true : false;

      log.debug("campos del heheheheh headaer", {
        tranDate,
        reversalDate,
      });
      /* log.debug("fECHAS2",new Date("15/10/2022")) <-- Esta fecha no es valida*/

      var invObj = record
        .create({
          type: record.Type.JOURNAL_ENTRY,
          isDynamic: true,
        })
        .setValue({
          fieldId: "externalid",
          value: externalid,
        })
        .setValue({
          fieldId: "tranId",
          value: tranId,
        })
        .setValue({
          fieldId: "subsidiary",
          value: subsidiary,
        })
        .setValue({
          fieldId: "currency",
          value: currency,
        })
        .setValue({
          fieldId: "exchangerate",
          value: exchangerate,
        })
        .setValue({
          fieldId: "postingperiod",
          value: postingperiod,
        })
        .setValue({
          fieldId: "trandate",
          value: new Date(tranDate),
        })
        .setValue({
          fieldId: "custbody_fam_jrn_reversal_date",
          value: new Date(tranDate),
        })
        .setValue({
          fieldId: "c",
          value: isDeferred,
        });

      log.debug("Paso datos del headers");
      datos.lines.forEach((line) => {
        let journalItemLine_accountRef = line.journalItemLine_accountRef;
        let journalItemLine_debitAmount = line.journalItemLine_debitAmount;
        let journalItemLine_creditAmount = line.journalItemLine_creditAmount;
        let journalItemLine_memo = line.journalItemLine_memo;
        let journalItemLine_entityRef = line.journalItemLine_entityRef;
        let cseg_skan_contrato = line.cseg_skan_contrato;
        let journalItemLine_departmentRef = line.journalItemLine_departmentRef;
        let journalItemLine_classRef = line.journalItemLine_classRef;
        let journalItemLine_locationRef = line.journalItemLine_locationRef;
        let journalItemLine_taxCodeRef = line.journalItemLine_taxCodeRef;
        let journalItemLine_taxCodeAmount = line.journalItemLine_taxCodeAmount;

        invObj
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "account",
            value: journalItemLine_accountRef,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "debit",
            value: journalItemLine_debitAmount,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "credit",
            value: journalItemLine_creditAmount,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "memo",
            value: journalItemLine_memo,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "custcol_skan_contrato2",
            value: cseg_skan_contrato,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "department",
            value: journalItemLine_departmentRef,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "class",
            value: journalItemLine_classRef,
          })
          .setCurrentSublistValue({
            sublistId: "line",
            fieldId: "location",
            value: journalItemLine_locationRef,
          })
          .commitLine({
            sublistId: "line",
          });
        log.debug("haciendo commit");
      });
      log.debug("Se agregón un commit");
      let idObj = invObj.save({
        ignoreMandatoryFields: true,
      });

      cabecera.push({
        idInvoice: idObj,
      });

      log.debug("Se hizo una invoice", cabecera);
    });
    return cabecera;
  }

  return { getInputData, map, reduce, summarize };
});
