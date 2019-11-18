var spruits2 = (function(){
"use strict";

let 
  isArray, isFunction, isString, id = 0, getId, mediaQuery, getAttr,
  Component,
  InputText, AlphaNumericString, DigitString, DecimalDigitString,
  InputCheckbox,
  Select,
  Month, Modal, Calendar, InputDate,
  Modes, Spinner, TimePicker, InputTime, InputDateAndTime,
  ResizeAgent,
  Table, TabSheet, CustomType,
  Entity, Container,
  Menu,
  Crud,
  Notification,
  PageManager,
  TouchManager,
  init,
  wc,
  addCssRules,
  addCssRule;

const TABLE = "<table>";
const TH = "<th>";
const TR  = "<tr>";
const TD = "<td>";
const DIV = "<div>";
const SPAN = "<span>";
const INPUT = "<input>";
const I = "<i>";

const DEFAULT_FIELD_CLASS = "spruit-field";

isArray = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

isFunction = function(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

isString = function (obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};

getId = function(base) {
  let yourId;

  if (base !== undefined) {
    yourId = base + id;
  } else {
    yourId = "" + id;
  }
  id++;

  return yourId;
}

mediaQuery = function(){ 
  return ($(window).width() >= 800); 
}; // mediaQuery

// attrs = { attr1:X, attr2:Y, ... },                            for example: { span:{ class:"my-span" }, label: { style:"width:1em;height:10em;" } }
// defVal = the default value if searched for attr is not found, for example: "width:2em;"
// 3rd, 4th, ... args = keys, attrs[arg3][args4][...],           for example: 3rd arg = "label", 4th arg = "style"
//                                                               usage:       getAttr(args, "width:2em;", "label", "style");
getAttr = function getAttr(attrs, defVal) {
  let val = attrs, attr = [].slice.call(arguments).slice(2), len = attr.length, i;

  if (val !== undefined) {
    for (i=0; i<len; i++) {
      val = val[attr[i]];
      if (val === undefined) break;
    }
  }

  if (val === undefined) val = defVal;
  
  return val;
}
AlphaNumericString = function(args) {
let
matchRegExp = args.matchRegExp,
init,
validate;
init = function(that) {
  InputText.call(that, args);
};
init(this);
validate = function() {
  let 
  valid = { valid:true }, value, regExp;

  regExp = matchRegExp ? matchRegExp : /[^a-z0-9A-Z]/; // default: test a non digit/alpha character

  value = this.getVal("val");
  // console.log("DigitString.validate, value=" + value);

  if (regExp.test(value)) {
    valid.valid = false;
    valid.invalid = value;
  }

  return valid;
};
this.validate = validate;
};Calendar = function(args) {
let
attrs = args.attrs,$modalcontainer = args.$modalcontainer,$pageboxes = args.$pageboxes,crud = args.crud,view = args.view,
timestamp,$dest,$content,modalId,modal,modalAttrs,
inc,dec,setCalendar,clickDay,init,
getVal,setVal,empty;
inc = function() {
  let date = new Date(timestamp);

  if (date.getMonth() < 11) {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setDate(1);
    date.setMonth(0);
    date.setFullYear(date.getFullYear() + 1);
  }

  setCalendar(date.getTime());
  return false;
};
dec = function() {
  let date = new Date(timestamp);

  if (date.getMonth() > 0) {
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
  } else {
    date.setDate(1);
    date.setMonth(11);
    date.setFullYear(date.getFullYear() - 1);
  }

  setCalendar(date.getTime());
  return false;
};
setCalendar = function(ts) {
  let srcdate, mon, year, r, day = 1, dayOfWeek, daysInMonth, row, $day;

  timestamp = ts;

  srcdate = new Date(timestamp);
  mon = Month.getMonStr(srcdate.getMonth()),
  year = srcdate.getFullYear();
  daysInMonth = Month.getDaysInMonth(srcdate),

  $content.find("tr:first-child td:nth-child(2)").html(mon + " " + year); // $(".spruits-calendar tr:first-child td:nth-child(2)").html(mon + " " + year);

  /*$weeks*/
  for (row=3;row<=8;row++) {
    $content.find("tr:nth-child(" + row + ") td").each( function() { $(this).empty().css("cursor", "").off("click"); });
  }

  for (r = 0; r < 6 && day <= daysInMonth; day++) {
    row = $content.find("tr:nth-child(" + (r + 3) + ")");
    srcdate.setDate(day);

    dayOfWeek = srcdate.getDay();

    switch (dayOfWeek) {
    case 0: // su
      $day = row.children("td:nth-child(" + 7 + ")");
      $day.html(day).css("cursor", "pointer").on("click", clickDay);
      r++;
      break;

    default:
      $day = row.children("td:nth-child(" + dayOfWeek + ")");
      $day.html(day).css("cursor", "pointer").on("click", clickDay);
      break;
    } // switch
  } // for (r)
};
clickDay = function(e) {
  let day = $(this).html(), date = new Date(timestamp);

  date.setDate(day);
  timestamp = date.getTime();
  $dest.val( "" + date.getFullYear() +  "-" + (("00" + (date.getMonth() + 1)).slice(-2))+ "-" + (("00" + date.getDate()).slice(-2)) );
  modal.set("close");
  return false;
};
init = function(that) {
  if (args === undefined) {
    args = {};
  };
  if (args.fieldClass === undefined) {
    args.fieldClass = "spruits-calendar";
  }
  args.insertLabel = false;

  Component.call(that, args);

  that.$field.append(
    $("<table>").append( $("<tbody>").append(
      $("<tr>").append(
        $("<td>").append( $("<i>", {class:"fa fa-angle-left"}).on("click", dec) ),
        $("<td>").attr("colspan", "5"),
        $("<td>").append( $("<i>", {class:"fa fa-angle-right"}).on("click", inc) ),
      ),
      $("<tr>").append( ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => { return $("<td>").html(day) }) ),
      Array(6).fill( Array(7).fill(null) ).map(row => $("<tr>").append(row.map(col => $("<td>"))))
    )));
  $content = that.$field;

  if (attrs !== undefined) {
    modalAttrs = attrs.modal;
  }
  modalId = getId("spruits-cal");
  modal = new Modal({ fieldName:"Calendar", "$modalbody":$content, id:modalId, $container:$modalcontainer, attrs:modalAttrs, $pageboxes:$pageboxes, crud:crud, attrs:{span:{style:"z-index:10;"}} });
};
init(this);
getVal = function(propName) {
  return $content;
};
setVal = function(propName, val) {
  switch(propName) {
  case "field name":
    modal.set("$title", val);
    // $content.children("span:first-child").html(val);
    break;
  default:
  case "val":
  case "date":
    setCalendar(val === undefined ? propName : val);
    break;
  case "$dest":
    $dest = val;
    break;
  case "show":
    modal.set("show"); // $field.css("display", "block");
    // modal.$field.find(".modal-content").removeClass("modalout").addClass("modalin");
    //$content.removeClass("calendarSlideOut").addClass("calendarSlideIn");
    break;
  } // switch
};
empty = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
};Component = function(args) {
let
insertLabel = args.insertLabel,name = args.name,fieldClass = args.fieldClass,$field = args.$field,attrs = args.attrs,view = args.view,isKey = args.isKey,
$label,
init,
get,set,handleBlur;
init = function(that) {
  name = args.fieldName;
  
  if (view !== undefined) {
    if (view.fields[name] === undefined) {
      console.log("*** Component, view.fields === undefined, name=" + name);
    }
    $field = view.fields[name].$field;
    $label = view.fields[name].$label;
    attrs = view.fields[name].attrs;
    insertLabel = false;
  } else {
    if ($field === undefined) {
      $field = $("<span class=\"spruit-field\"></span>");

      if (attrs !== undefined) {
	if (attrs.span !== undefined) {
          if (attrs.mediaquery !== undefined && attrs.mediaquery.span !== undefined) {
            if (attrs.mediaquery.span()) {
              $field.attr(attrs.span());
            }
          } else {
            $field.attr(attrs.span);
          }
	}
      }
    }

    if (fieldClass !== undefined) {
      if (fieldClass !== false) {
	$field.removeClass("spruit-field");
	$field.addClass(fieldClass);
      }
    }

    $label = $("<label>").html(insertLabel !== false ? name : "").attr((attrs !== undefined && attrs.label !== undefined) ? attrs.label : {});
    if (isFunction($field.append)) $field.append($label);
  }
};
init(this);
get = function(propName) {
  switch (propName) {
  case "val":
    return this.getVal();
    break;
  case "isKey":
    return isKey;
    break;
  case "valid":
    return this.validate();
  default:
    return this.getVal(propName);
    break;
  } // switch
};
set = function(propName, val) {
  let localCacheVal;

  switch(propName) {
  case "val":
    this.setVal(val);
    break;
  case "empty":
    this.empty();
    break;
  case "invalid-color":
    this.setInvalidColor ? this.setInvalidColor(propName, val) : this.$field.find("input").addClass("invalid");
    break;
  case "reset-invalid-color":
    this.resetInvalidColor ? this.resetInvalidColor(propName, val) : this.$field.find("input").removeClass("invalid");
    break;
  default:
    this.setVal(propName, val);
    break;
  } // switch
};
handleBlur = function(e, me) {
  let valid;
  
  e.preventDefault();
  console.log("Component, " + this.name + " Blur, val=" + me.get("val"));

  valid = me.validate();
  if (valid.valid === false) me.set("invalid-color");
  else me.set("reset-invalid-color");
};
this.name = name;
this.attrs = attrs;
this.$label = $label;
this.$field = $field;
this.get = get;
this.set = set;
this.handleBlur = handleBlur;
};Container = function(args) {
let
init,
createField;
init = function(that) {
  that.name = args;
  that.fields = {};
};
init(this);
createField = function(fieldName, type, args) {
  if (args === undefined) {
    args = {};
    args["fieldName"] = fieldName;
  }

  if (args.fieldName === undefined) {
    args["fieldName"] = fieldName;
  }

  if (args.crud === undefined) {
    args.crud = this.crud; // PageManager has set the property XXX
  }

  if (args.responsive === undefined) args.responsive = this.responsive;
  if (args.resizeAgent === undefined) args.resizeAgent = this.resizeAgent;
  
  try {
    this.fields[fieldName] = new type(args);
  } catch (err) {
    console.log(err);
  }
};
this.createField = createField;
};Crud = function(args) {
let
attrs = args.attrs,$modalcontainer = args.$modalcontainer,$pageboxes = args.$pageboxes,pm = args.pm,notification = args.notification,
CREATE_PENDING,CREATE_OK,CREATE_NOK,CREATE_VALID_NOK,READ_PENDING,READ_OK,READ_NOK,crudObj,entity,$log,status,valid,$icon,buttons,$buttons,modalAttrs,modalId,modal,notificationMap,
send,handleClickButton,handleClickIcon,init,
getVal,setVal,empty,validate;
send = function(msg) {
  $.ajax({
    type: "POST",
    url: "/crud",
    contentType: "application/json",
    data: JSON.stringify(msg),

    success: function(response) { 
      console.log("Crud.send.success, response=" + JSON.stringify(response) + "\n   entity.name=" + entity.name);

      switch (response.action) {
      case "C":
      case "U":
      case "D":
        if (response.resultCode === "1") {
          status = CREATE_OK;
          modal.set("close");
        } else {
          status = CREATE_NOK;
        }
        notification.set("show", response.action + ": " + notificationMap[response.resultCode]);
        break;
      case "R":
        if (response.resultCode === "1") {
          status = READ_OK;
          modal.set("close");
          entity.set("val", response.data);
        } else {
          status = READ_NOK;
        }
        notification.set("show", response.action + ": " + notificationMap[response.resultCode]);
        break;
      } // switch(response.action)
    }, // success
    error: function(jqXHR, exception) { console.log(jqXHR.status); }
  });
};
handleClickButton = function() {
  let val, action, valid;

  console.log("Crud.buttonClickHandler=" + $(this).html() + ", " + entity.name);

  action = $(this).html();

  switch(action) {
  case "C":
  case "U":
    valid = entity.get("valid");
    if (valid.valid !== true) {
      notification.set("show", action + ": " + notificationMap["valid.valid !== true"]);
      status = CREATE_VALID_NOK;
      Object.keys(valid.invalid).forEach(fieldName => { entity.fields[fieldName].set("invalid-color", valid.invalid[fieldName]); });
      console.log("buttonClickHandler, valid=" + JSON.stringify(valid));
    } else {
      val = entity.get("val");
      Object.values(entity.fields).forEach(comp => comp.set("reset-invalid-color"));
      if ($log !== undefined) {
        $log.append("Crud.buttonClickHandler=" + $(this).html() + ", " + entity.name + "<br>, val=" + JSON.stringify(val) + "<br>");
      }
      status = CREATE_PENDING;
      send({ action:action, entity:entity.name, data:val });
    }
    break;
  case "R":
  case "D":
    val = entity.get("key");
    if ($log !== undefined) {
      $log.append("Crud.buttonClickHandler=" + $(this).html() + ", " + entity.name + "<br>, val=" + JSON.stringify(val) + "<br>");
    }
    status = READ_PENDING;
    send({ action:action, entity:entity.name, data:val });
    break;
  } // switch(action)

  return false;
};
handleClickIcon = function(){
  entity = pm.get("entity");
  modal.set("show");
  return false;
};
init = function(that) {

  /* const */
  CREATE_PENDING = 0;
  CREATE_OK = 1;
  CREATE_NOK = 2;
  CREATE_VALID_NOK = 3;
  READ_PENDING = 0;
  READ_OK = 1;
  READ_NOK = 2;

  if (args.fieldClass === undefined) args.fieldClass = "spruits-crud";
  Component.call(that, args);
  crudObj = that;
  buttons = {};
  notificationMap = { 
    "1":  "successful", 
    "10": "exists already", 
    "11": "not found",
  
    "valid.valid !== true": "validation failed"
  };

  buttons["create"] = $("<i>", { class:"crud-button" }).html("C").on("click", handleClickButton);
  buttons["read"] =   $("<i>", { class:"crud-button" }).html("R").on("click", handleClickButton);
  buttons["update"] = $("<i>", { class:"crud-button" }).html("U").on("click", handleClickButton);
  buttons["delete"] = $("<i>", { class:"crud-button" }).html("D").on("click", handleClickButton);
  $buttons = $("<div>", { class:"spruits-crud-modal-content" }).append(buttons.create, buttons.read, buttons.update, buttons.delete);

  if (attrs !== undefined) modalAttrs = attrs.modal;
  
  // modalId = getId("spruits-crud");
  modal = new Modal({ fieldName:"CRUD", $modalbody:$buttons, id:modalId, $container:$modalcontainer, attrs:modalAttrs, $pageboxes:$pageboxes, crud:crudObj /*, closeCallback:modalClosed */ });

  $icon = $("<i>", { class:"fa fa-database" }).on("click", handleClickIcon);

  that.$field.append($icon);
  that.modal = modal; // XXX for testing, REMOVE
};
init(this);
getVal = function(propName) {
  switch(propName) {
  case "isHidden":
    return crudObj.$field.hasClass("fadeOut");
    break;
  case "status":
    return status;
    break;
  }
};
setVal = function(propName, val) {
  switch(propName) {
  case "show":
    crudObj.$field.removeClass("fadeOut").addClass("fadeIn");
    break;
  case "hide":
    crudObj.$field.removeClass("fadeIn").addClass("fadeOut");
    break;
  case "$log":
    $log = val;
    break;
  }
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};CustomType = function(args) {
let
fields = args.fields,attrs = args.attrs,callback = args.callback,crud = args.crud,view = args.view,
i,screenRowClass,viewObj,
init,
getVal,setVal,empty,validate;
init = function(that) {
  if (args !== undefined) {
    fields = args.fields;
    view = args.view;
    if (args.attrs !== undefined && args.attrs.$row !== undefined) {
      screenRowClass = args.attrs.$row.class;
    }
    if (screenRowClass === undefined) screenRowClass = "field-row";
    callback = args.callback;
    crud = args.crud;
  }
  Component.call(that, args);
  Container.call(that, that.name);
  that.crud = crud;

  if (view !== undefined) {
    fields = view.fields[that.name].get("fields");
    viewObj = view.fields[that.name].get("that");
  }
  if (fields !== undefined) {
    for (i in fields) {
      if (fields.hasOwnProperty(i)) {
        if (view === undefined) {
          that.createField(i, fields[i].type, fields[i].args);
        } else {
          that.createField(i, fields[i].type, { view:viewObj });
        }
      }
    } // for (i)

    if (view === undefined) {
      if (callback !== undefined) {
        callback(that);
      } else {
        //that.insertFields(screenRowClass);
        //that.$field.append(that.$screen);
	that.$field.append( Object.values(that.fields).map(comp => { return $("<div>", { class:screenRowClass }).append(comp.$field); }) );
      }
    }
  } // if (fields)
};
init(this);
getVal = function(propName) {
    let val, i;

    switch (propName) {
    case "fields":
      return fields;
      break;
    case "this":
      return this;
      break;
    default:
      val = {};
      for (i in this.fields) {
        if (this.fields.hasOwnProperty(i)) {
          val[i] = this.fields[i].get("val");
          console.log("CustomeType.getVal[" + i + "] = " + val[i]);
        }
      } // for (i)
      break;
    case "empty":
      val = {};
      for (i in this.fields) {
        if (this.fields.hasOwnProperty(i)) {
          val[i] = this.fields[i].get("empty");
          console.log("CustomeType.getVal[" + i + "] = " + val[i]);
        }
      } // for (i)
      break;
    } // switch

    return val;
};
setVal = function(propName, val) {
    let i;

    if (val === undefined) {
      val = propName;
    }
    switch (propName) {
    default:
      for (i in this.fields) {
        if (this.fields.hasOwnProperty(i)) {
          this.fields[i].set("val", val[i]);
        }
      } // for (i)
      break;
    } // switch
};
empty = function() {
    let i;

    for (i in this.fields) {
      if (this.fields.hasOwnProperty(i)) {
        this.fields[i].empty();
      }
    } // for (i)
};
validate = function() {
  return { valid:true };
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};DecimalDigitString = function(args) {
let
formatValue,init,
validate;
formatValue = function(value) {
  let formattedValue = value, decimalNumber, signNegative = false, signLen = 0, signChar = "";

  if (value.length) {
    decimalNumber = value.split(".");

    if (decimalNumber[0].charAt(0) === "-") {
      signNegative = true;
      signLen = 1;
    }
    if (decimalNumber.length === 1) decimalNumber.push("0");
    if ((signNegative === true) && (parseInt(decimalNumber[0]) === 0) && (parseInt(decimalNumber[1]) > 0)) signChar = "-";
    decimalNumber[0] = "" + parseInt(decimalNumber[0]);
    decimalNumber[1] = (decimalNumber[1] + "00000").slice(0, 5);
    formattedValue = signChar + decimalNumber[0] + "." + decimalNumber[1];
  }
  
  return formattedValue;
};
init = function(that) {
  if (args === undefined) {
    args = {};
  }
  if (args.size === undefined) {
    args.size = "21";
  }
  InputText.call(that, args);
};
init(this);
validate = function() {
  let 
  valid = { valid:true }, value, regExp = /^\-?\d*\.?\d*$/, // [-] digits [ . [ decimal-digits ] ]  , XXX: accepts "-", "." and "-."
  formattedValue;
  
  value = this.getVal("val");

  if (value.match(regExp) === null || value === "-" || value === "." || value === "-.") {
    valid.valid = false;
    valid.invalid = value;
  } else {
    formattedValue = formatValue(value);
    if (formattedValue !== value) this.set("val", formattedValue);
  }

  return valid;
};
this.validate = validate;
};DigitString = function(args) {
let
init,
validate;
init = function(that) {
  InputText.call(that, args);
};
init(this);
validate = function() {
    let 
      valid = { valid:true }, value, regExp = /\D/; // test a non-digit character

    value = this.getVal("val");
    // console.log("DigitString.validate, value=" + value);

    if (regExp.test(value)) {
      valid.valid = false;
      valid.invalid = value;
    }

    return valid;
};
this.validate = validate;
};Entity = function(args) {
let
screen = args.screen,view = args.view,cal = args.cal,timepicker = args.timepicker,responsive = args.responsive,resizeAgent = args.resizeAgent,
State,
init,
getVal,setVal,empty,validate,addScreenLabel,insertFields,load;
init = function(that) {
  Component.call(that, args);
  Container.call(that, that.name);
  State = {};
};
init(this);
getVal = function(propName) {
  let val;

  if (propName === undefined) propName = "val";
  
  switch(propName){
  case "valid":
    val = this.validate();
    break;
  case "val":
    val = {};
    Object.values(this.fields).forEach(comp => { val[comp.name] = comp.get("val"); });
    break;
  case "key":
    val = {};
    Object.values(this.fields).forEach(comp => { if (comp.get("isKey")) val[comp.name] = comp.get("val"); });
    break;
  case "State":
    return State;
    break;
  default:
    console.log("Entity.getVal, " + this.name + ", unknown propName=" + propName);
    break;
  }
  return val;
};
setVal = function(propName, val) {
  if (val === undefined) {
    val = propName;
    propName = "val";
  }
  switch (propName) {
  case "val":
    Object.values(this.fields).forEach(comp => { comp.set("val", val[comp.name]); });
    break;
  case "State":
    State[val.key] = val.value;
    break;
  default:
    console.log("Entity.setVal, " + this.name + ", unknown propName=" + propName);
    break;
  }
};
empty = function() {
};
validate = function() {
  let valid = { valid:true, invalid:{} };

  Object.values(this.fields).forEach(comp => {
    let fieldValid = comp.get("valid");
    if (fieldValid.valid !== true) {
      valid.valid = false;
      valid.invalid[comp.name] = fieldValid.invalid;
    }
  });
  return valid;
};
addScreenLabel = function() {
  this.$label.html(this.name + " Maintenance");
};
insertFields = function(rowClass, lastRowClass) {
  this.$field.append(Object.values(this.fields).map(comp => { return $("<div>", {class:rowClass ? rowClass : "screen-row"}).append(comp.$field); }));
  this.$field.children(":last-child").addClass(lastRowClass ? lastRowClass : "last");
};
load = function() {
  if (screen === undefined) {
    this.$field.append("<p>TBA</p>");
    this.addScreenLabel();
  } else {
    screen.create(this);
  }
};
this.cal = cal;
this.timepicker = timepicker;
this.responsive = responsive;
this.resizeAgent = resizeAgent;
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
this.addScreenLabel = addScreenLabel;
this.insertFields = insertFields;
this.load = load;
};// this copied from ./src to ../components
init = function(args) {
  let pm, tm, screens = args.screens, menubar = args.menubar, dropdown = args.dropdown;

  pm = new PageManager({ fieldName:"PageManager", insertLabel:false, screens:screens, menubar:menubar, dropdown:dropdown });
  tm = new TouchManager({ fieldName:"TouchManager" });

  return pm;
};
InputCheckbox = function(args) {
let
view = args.view,custom = args.custom,
initial,$input,$checkmark,
handleClickCheckbox,init,
getVal,setVal,empty,validate;
handleClickCheckbox = function(e) {
  e.preventDefault();
  $input[0].checked = $input[0].checked ? false : true;
};
init = function(that) {
  initial = false;

  if (args === undefined) {
    args = {};
  };
  if (args.initial !== undefined) {
    initial = args.initial;
    if (initial !== true) {
      initial = false;
    }
  }

  Component.call(that, args);
  if (view === undefined) {
    $input = $("<input>", { type:"checkbox" });
    $input[0].checked = initial;
    that.$field.append($input);
    if (custom !== false) {
      that.$field.addClass("checkbox");
      $input.attr("style", "margin-right:0");
      $checkmark = $("<span>", { class:"checkmark" }).on("click", handleClickCheckbox);
      that.$field.append($checkmark);
    }
  } else {
    $input = view.fields[that.name].get("$input");
    initial = view.fields[that.name].get("initial");
    $input[0].checked = initial;
  }
};
init(this);
getVal = function(propName) {
  switch(propName) {
  case "$input":
    return $input;
    break;
  case "empty":
    return initial;
    break;
  default:
    return $input.prop("checked");
    break;
  } // switch
};
setVal = function(propName, val) {
  if (val === undefined) {
    $input[0].checked = propName;
  } else {
    switch(propName) {
    case "val":
      $input[0].checked = val;
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  $input[0].checked = initial;
};
validate = function() {
  return { valid:true };
};
this.$input = $input;
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};InputDateAndTime = function(args) {
let
mode = args.mode,cal = args.cal,timepicker = args.timepicker,view = args.view,
inputdate,inputtime,
init,
getVal,setVal,empty,validate;
init = function(that) {
  Component.call(that, args);

  if (view === undefined) {
    that.$field.addClass("spruits-inputdateandtime");
    inputdate = new InputDate({ fieldName:that.name, fieldClass:"", insertLabel:false, cal:cal });
    inputtime = new InputTime({ fieldName:that.name, fieldClass:"", insertLabel:false, mode:mode, timepicker:timepicker });

    that.$field.append(inputdate.$field, inputtime.$field);
  } else {
    inputdate = view.fields[that.name].get("inputdate");
    inputtime = view.fields[that.name].get("inputtime");
  }
};
init(this);
getVal = function(propName) {
  switch (propName) {
  case "inputdate":
    return inputdate;
    break;
  case "inputtime":
    return inputtime;
    break;
  case "empty":
    return { inputdate:inputdate.get("empty"), inputtime:inputtime.get("empty") };
    break;
  default:
    return { inputdate:inputdate.get("val"), inputtime:inputtime.get("val") };
    break;
  } // switch
};
setVal = function(propName, val) {
  if (val === undefined) {
    inputdate.set("val", propName.inputdate);
    inputtime.set("val", propName.inputtime);
  }
  else {
    switch(propName) {
    case "val":
      inputdate.set("val", val.inputdate);
      inputtime.set("val", val.inputtime);
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  inputdate.set("empty");
  inputtime.set("empty");
};
validate = function() {
  let
  valid = { valid:true }, validInputdate, validInputtime;

  validInputdate = inputdate.get("valid");
  validInputtime = inputtime.get("valid");

  if (validInputdate.valid === false) {
    valid.valid = false;
    valid.invalid = { "inputdate":inputdate.get("val") };
  }

  if (validInputtime.valid === false) {
    if (valid.invalid === undefined) {
      valid.valid = false;
      valid.invalid = { "inputtime":inputtime.get("val") };
    } else {
      valid.invalid["inputtime"] = inputtime.get("val");
    }
  }

  return valid;
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};InputDate = function(args) {
let
cal = args.cal,view = args.view,
name,dest,
handleCalClick,Dest,init,
getVal,setVal,empty,validate;
handleCalClick = function(){
  if (cal.get("$field").hasClass("calendarSlideIn")) {
    return false;
  }
  cal.set("field name", name);
  cal.set("date", Date.now());
  cal.set("$dest", dest); // $(this).prev());
  cal.set("show");
  return false;
};
Dest = function(args) {
  let $dest = args.$dest;
  
  this.val = function(str) {
    $dest.val(str);
    $dest.trigger("blur");
  };
};
init = function(that) {
  Component.call(that, args);
  name = that.name;

  if (view === undefined) {
    that.$field.append(
      $(INPUT).attr({"type":"text", "size":"10", maxlength:"10"}).on("blur", e => that.handleBlur(e, that)), 
      $(I, {class:"fa fa-calendar"}).on("click", handleCalClick)
    ).css("whiteSpace","noWrap");
  }
  dest = new Dest({ $dest:that.$field.children("input") });
};
init(this);
getVal = function(propName) {
  switch(propName){
  default:
    return this.$field.children("input").val();
  case "empty":
    return "";
  }
};
setVal = function(propName, val) {
  if (val === undefined) {
    this.$field.children("input").val(propName);
  }
  else {
    switch(propName) {
    case "val":
      this.$field.children("input").val(val);
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  this.$field.children("input").val("");
};
validate = function() {
  let 
  valid = { valid:true },
  value,
  y, m, d, dateVal, dateVals, formattedValue; // [ year, mon, day ] which is created from the value

  value = this.get("val");
  if (value.length === 0) { // the field is empty

  } else { // there is a value in the field
    dateVals = value.split("-");
    if (dateVals.length !== 3) {
      valid.valid = false;
    } else { // dateVals.length === 3
      dateVals[0] = dateVals[0].trim();                    // y
      dateVals[1] = ("00" + dateVals[1].trim()).slice(-2); // m
      dateVals[2] = ("00" + dateVals[2].trim()).slice(-2); // d

      dateVals.forEach( function(x) {
        if (/\D/.test(x)) { // check for a non-digit character
          valid.valid = false;
        }
      });
      y = parseInt(dateVals[0]);
      if (valid.valid === false || isNaN(y) || y < 1970 || y > 2100) {
        valid.valid = false;
      } else { // year valid
        m = parseInt(dateVals[1]);
        if (isNaN(m) || m < 1 || m > 12) {
          valid.valid = false;
        } else { // month valid
          d = parseInt(dateVals[2]);
          if (isNaN(d) || d < 1 || d > Month.daysInMonth(y, m-1)) {
            valid.valid = false;
          } else { // day valid
            dateVal = Date.parse(dateVals[0]+"-"+dateVals[1]+"-"+dateVals[2]+"T00:00:00Z");
            if (isNaN(dateVal)) {
              valid.valid = false;
            }
          } // day valid
        } // month valid
      } // year valid
    } // dateVals.length === 3
    
    if (valid.valid === true) {
      formattedValue = dateVals[0] + "-" + dateVals[1] + "-" + dateVals[2];
      if (formattedValue !== value) this.set("val", formattedValue);
    }
  } // there is a value in the field

  if (valid.valid === false) {
    valid.invalid = value;
  }

  return valid;
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};InputText = function(args) {
let
size = args.size,$input = args.$input,view = args.view,
me,
init,
getVal,setVal,empty;
init = function(that) {
  let inputProps;
  
  Component.call(that, args);

  if (view !== undefined) {
    $input = view.fields[that.name].$input;
  }

  if ($input === undefined) {
    $input = $("<input type=\"text\">").on("blur", e => that.handleBlur(e, me));
    if (that.attrs !== undefined && that.attrs.input !== undefined) {
      if (isArray(that.attrs.input)) {
	that.attrs.input.forEach(val => that.$field.append( $("<input type=\"text\">").attr(val) ));
      } else {
        $input.attr(that.attrs.input);
	
	inputProps = getAttr(args.props, undefined, "input");
	if (inputProps !== undefined) Object.entries(inputProps).map(prop => $input.prop(prop[0], prop[1]));
	
        that.$field.append($input);
      }
    } else {
      that.$field.append($input);

      if (size !== undefined) {
        $input.attr({ "size":size, "maxlength":size });
        $input.addClass("len" + size);
      }
    }
  } // $input === undefined
  me = that;
};
init(this);
getVal = function(propName) {
  switch(propName) {
  default:
    return this.$input.val();
  case "empty":
    return "";
  }
};
setVal = function(propName, val) {
  if (val === undefined) {
    this.$input.val(propName);
  } else {
    switch(propName) {
    case "val":
      this.$input.val(val);
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  this.$input.val("");
};
this.$input = $input;
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
};InputTime = function(args) {
let
timepicker = args.timepicker,view = args.view,
mode,maxlength,maxH,name,dest,
handleClockClick,Dest,formatValue,init,
getVal,setVal,empty,validate;
handleClockClick = function() {
  timepicker.set("$dest", dest);
  timepicker.set("label", name);
  timepicker.set("show");
  timepicker.set("spinners", mode);
  return false;
};
Dest = function(args) {
  let $dest = args.$dest;
  
  this.val = function(str) {
    $dest.val(str);
    $dest.trigger("blur");
  };
};
formatValue = function(h, m, s, mic, timeValsLen) {
  let formattedValue;
  
  switch(timeValsLen) {
  case 2:
    formattedValue = h + ":" + m;
    break;
  case 3:
    formattedValue = h + ":" + m + ":" + s;
    break;
  case 4:
    formattedValue = h + ":" + m + ":" + s + "." + mic;
    break;
  default:
    break;
  }
  return formattedValue;
};
init = function(that) {
  mode = "hhmm"; /* configures the size (class) of the input field. Optional. */  
  maxlength = { "hhmm": "5", "hhmmss":"8", "hhmmssmicros":"15" };
  maxH = 23;

  if (args.mode !== undefined) {
    if (Modes[args.mode] === true) {
      mode = args.mode;
    }
  }

  if (args.maxH === 24) {
    maxH = args.maxH;
  }

  Component.call(that, args);
  name = that.name;

  if (view === undefined) {
    that.$field.append(
      $("<input>").addClass("spruits-inputtime-" + mode).attr("maxlength", maxlength[mode]).on("blur", e => that.handleBlur(e, that)),
      $("<i>", {class:"fa fa-clock-o"}).on("click", handleClockClick)
    );
  }
  dest = new Dest({ $dest:that.$field.children("input") });
};
init(this);
getVal = function(propName) {
  let val;

  switch (propName) {
  default:
    val = this.$field.children("input").val();
    break;
  case "empty":
    val = "";
    break;
  }

  return val;
};
setVal = function(propName, val) {
  if (val === undefined) {
    this.$field.children("input").val(propName);
  }
  else {
    switch(propName) {
    case "val":
      this.$field.children("input").val(val);
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  this.$field.children("input").val("");
};
validate = function() {
  let
  valid = { valid:true },
  value, formattedValue,
  x, h, m, s, mic, ssMicros, timeValsLen, timeVals;

  value = this.get("val");

  if (value.length === 0) { // the field is empty

  } else { // there is a value in the field
    timeVals = value.split(":");
    switch(mode) {
    case "hhmm":
      timeValsLen = 2;
      break;
    case "hhmmss":
      timeValsLen = 3;
      break;
    case "hhmmssmicros":
      if (timeVals.length === 3) {
        ssMicros = timeVals[2].split(".");
        if (ssMicros.length === 2) {
          timeVals[2] = ssMicros[0];
          timeVals.push(ssMicros[1]);
          timeValsLen = 4;
        } else {
          valid.valid = false;
        }
      } else {
        valid.valid = false;
      }
      break;
    default:
      valid.valid = false;
    } // switch (mode)

    if (valid.valid === false || timeValsLen !== timeVals.length) {
      valid.valid = false;
    } else {
      for (x of timeVals) {
        if (/\D/.test(x)) { // check for a non-digit character
          valid.valid = false;
          break;
        }
      } // for(x)
      
      h = parseInt(timeVals[0]);
      if (valid.valid === false || isNaN(h) || h < 0 || h > maxH) {
        valid.valid = false;
      } else { // valid hour
        h = ("00" + timeVals[0]).slice(-2);

        m = parseInt(timeVals[1]);
        if (isNaN(m) || m < 0 || m > 59) {
          valid.valid = false;
        } else { // valid min
          m = ("00" + timeVals[1]).slice(-2);

          if (timeValsLen > 2) { // validate s and micros
            s = parseInt(timeVals[2]);
            if (isNaN(s) || s < 0 || s > 59) {
              valid.valid = false;
            } else { // valid sec
              s = ("00" + timeVals[2]).slice(-2);

              if (timeValsLen > 3) { // validate micros
                mic = parseInt(timeVals[3]);
                if (isNaN(mic) || mic < 0 || mic > 59) {
                  valid.valid = false;
                } else { // valid micros
                  mic = (timeVals[3] + "000000").slice(0,6);
                }
              } // validate micros
            } // valid sec
          } // validate s and micros
        } // valid min
      } // valid hour
    }
  } // there is a value in the field

  if (valid.valid === false) {
    valid.invalid = value;
  } else {
    formattedValue = formatValue(h, m, s, mic, timeValsLen);
    if (formattedValue !== value) this.set("val", formattedValue);
  }

  return valid;
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};Menu = function(args) {
let
menubar = args.menubar,dropdown = args.dropdown,onClickDropdown = args.onClickDropdown,
$menu,
handleClickMenubar,handleClickSubmenu,collapseMenu,getDropdown,init,
getVal,setVal,empty,validate;
handleClickMenubar = function(e, ui) {
  let
  $m =        $(e.target).parent().parent(),
  $dropdown = $(e.target).parent();

  e.preventDefault();

  if ($m.hasClass("showdropdown")) {
    $dropdown.siblings().removeClass("show");
    if ($dropdown.hasClass("show")) {
      $dropdown.removeClass("show");
      $m.removeClass("showdropdown");
    } else {
      $dropdown.addClass("show");
    }
  } else {
    $m.toggleClass("showdropdown"); 
    $dropdown.toggleClass("show");
  }
};
handleClickSubmenu = function(e) {
  e.preventDefault();
  e.stopPropagation();

  if ($(this).hasClass("fa-angle-down")) {
    $(this).next().addClass("show-dropdown-content");
    $(this).removeClass("fa-angle-down").addClass("fa-angle-up");
  } else {
    $(this).next().removeClass("show-dropdown-content");
    $(this).removeClass("fa-angle-up").addClass("fa-angle-down");
  }
};
collapseMenu = function() {
  let $dropdown = $menu.children(".show"), $dropdownContent = $dropdown.children(".dropdown-content");

  // console.log("collapseMenu");

  $menu.removeClass("showdropdown");
  $dropdown.removeClass("show");
    
  $dropdownContent.children("li").each(function() {
    let $li = $(this);
    $li.find("i.fa.fa-angle-up").each(function() { $(this).removeClass("fa-angle-up").addClass("fa-angle-down"); });
    $li.find("ul.show-dropdown-content").each(function() { $(this).removeClass("show-dropdown-content"); });
  });
};
getDropdown = function(menuItem, dropdown, submenu) {
  if (dropdown[menuItem] === undefined) { console.log("getDropdown, menuItem=" + menuItem + ", undefined"); return ""; }

  return $("<ul>", { class:submenu ? "dropdown-content-submenu" : "dropdown-content" }).append( dropdown[menuItem].map(item => {
    let $li = $("<li>", submenu ? { class:"mark" } : {}), $a = $("<a>"), onClick;
    if (isString(item)) {
      $li.append($a.attr("id", item.replace(/ /g, "")).html(item).on("click", (e) => { onClickDropdown(e, item); collapseMenu(); }));
    }
    else {
      onClick = item.onClick ? item.onClick : onClickDropdown;
      $li.append( $a.attr("id", item.text.replace(/ /g, "")).on("click", (e) => onClick(e, item.text)).html(item.text) );
      if (dropdown[item.text]) {
	$li.append($("<i>", { class:"fa fa-angle-down" }).on("click", handleClickSubmenu), getDropdown(item.text, dropdown, true));
      }
    }
    return $li; // $("<li>").append($a);
  }) );
};
init = function(that) {
  Component.call(that, args);

  $menu = $("<ul>" , { class:"spruits-menubar" }).append( menubar.map(item => {
    return $("<li>", { class:"dropdown " }).append(
      $("<a>", { class:"dropbtn" }).html(item).attr("href","javascript:;").on("click", handleClickMenubar),
      getDropdown(item, dropdown)
    );
  }) );

  that.$field.append($menu);
};
init(this);
getVal = function(propName) {
};
setVal = function(propName, val) {
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};Modal = function(args) {
let
closeCallback = args.closeCallback,modalinClass = args.modalinClass,modaloutClass = args.modaloutClass,id = args.id,$pageboxes = args.$pageboxes,crud = args.crud,
$modalcontainer,$bodycontent,$modalBody,$title,iHidedPageboxes,iHidedCrud,
handleCloseClick,handleCloseEnd,init,
getVal,setVal;
handleCloseClick = function(e) {
  e.preventDefault();

  if (closeCallback !== undefined) {
    closeCallback(e, $title.html());
  }
  $(this).parents(".modal-content").removeClass("modalIn").addClass("modalout");
  return false;
};
handleCloseEnd = function(e) {
  e.preventDefault();
  
  if ($(this).hasClass("modalout")) {
    $(this).parents(".spruits-modal").css("display","none");
    if (iHidedPageboxes === true) {
      $pageboxes.removeClass("hide");
      iHidedPageboxes = false;
    }
    if (iHidedCrud === true) {
      crud.set("show");
      iHidedCrud = false;
    }
  }
  return false;
};
init = function(that){
  if (args === undefined) {
    args = {};
  };
  if (args.fieldClass === undefined) {
    args.fieldClass = "spruits-modal";
  }
  args.insertLabel = false;

  Component.call(that, args);

  $modalcontainer = args.$container;
  $bodycontent = args.$modalbody;
  $title = $("<h2>");
  $title.html(that.name);
  iHidedPageboxes = false;
  iHidedCrud = false;

  $modalBody = $("<div>", {class:"modal-body"});
  if ($bodycontent !== undefined) {
    $modalBody.append($bodycontent);
  }

  that.$field.append(
    $("<div>", {class:"modal-content"}).append(
      $("<div>", {class:"modal-header"}).append(
        $("<span>", {class:"close"}).html("&times;")
        .on("click", handleCloseClick),
        $title
      ),

      $modalBody,

      $("<div>", {class:"modal-footer"}).append(
        "&nbsp;"
      )
    ) // .modal-content
    .on("animationend", handleCloseEnd)
  ); // .spruits-modal
  that.$field.attr("id", id);
  if ($modalcontainer) $modalcontainer.append(that.$field);
};
init(this);
getVal = function(){};
setVal = function(propName, val) {
    switch(propName) {
    case "$modalbody":
      $modalBody.children().detach();
      $modalBody.append(val);
      break;
    case "$title":
      $title.html(val);
      break;
    case "show":
      this.$field.css("display", "block");
      this.$field.find(".modal-content").removeClass("modalout").addClass("modalin");
      if (($pageboxes !== undefined) && ($pageboxes.hasClass("hide") === false)) {
        $pageboxes.addClass("hide");
        iHidedPageboxes = true;
      } else {
        iHidedPageboxes = false;
      }
      if ((crud !== undefined) && (crud.get("isHidden") === false)) {
        crud.set("hide");
        iHidedCrud = true;
      } else {
        iHidedCrud = false;
      }
      break;
    case "close":
      this.$field.find(".modal-content").removeClass("modalin").addClass("modalout");
      break;
    } // switch
  };
this.getVal = getVal;
this.setVal = setVal;
};//****************************************************************************************************************************************************************************
Modes = { "hhmm":true, "hhmmss":true, "hhmmssmicros":true };
Month = {
  monInt: {
    "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5, "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
  },

  getMonStr: function(mon) {
    let monStr = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];

    return monStr[mon];
  },
  daysInMonth: function(year, mon) {
    let leapYear = 0;

    switch (mon) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 1:
      if ((year % 100) === 0) {
        if ((year % 400) === 0) {
          leapYear = 1;
        }
      } else {
        if ((year % 4) === 0) {
          leapYear = 1;
        }
      }
      return 28 + leapYear;
    default:
      return 30;
    }
  },
  getDaysInMonth: function(date) {
    return Month.daysInMonth(date.getFullYear(), date.getMonth());
  },

  str2int: function(monStr) {
    return Month.monInt[monStr];
  }
}; // Month
Notification = function(args) {
let
$content,
show,init,
getVal,setVal,empty,validate;
show = function(args) {
  let txt = args.text, notificationObj = args.notificationObj;

  if (notificationObj.$field.hasClass("fadeIn")) {
    return false;
  }
  $content.html(txt);
  notificationObj.$field.addClass("fadeIn");
  setTimeout(function(){
    notificationObj.$field.removeClass("fadeIn");
    $content.html("");
  }, 2000);
  return true;
};
init = function(that) {
  if (args.fieldClass === undefined) {
    args.fieldClass = "spruits-notification hide";
  }
  if (args.$field === undefined) {
    args.$field = $("<div>");
  }

  Component.call(that, args);
  
  $content = $("<div>", { class:"content" });
  that.$field.append($content);
};
init(this);
getVal = function(propName) {
};
setVal = function(propName, val) {
  switch(propName) {
  case "show":
    show({ text:val, notificationObj:this });
    break;
  }
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};PageManager = function(args) {
let
screens = args.screens,menubar = args.menubar,dropdown = args.dropdown,attrs = args.attrs,
$container,$homepage,$pageboxes,$home,$arrowLeft,$arrowRight,pagesI,pages,menu,cal,tp,ra,notif,crud,slideInClass,slideOutClass,slideInFromRightClass,slideOutToLeftClass,
handleClickHome,handleSwipeRight,handleSwipeLeft,deletePage,handleClickDelButton,handleFrameSwipeLeft,Page,createPage,handleClickMenuItem,init,
getVal,setVal,empty,validate;
handleClickHome = function(e) {
  e.preventDefault();
    
  if ($home.hasClass("myhome-2x")) {
    $home.removeClass("myhome-2x");
    if (pages.length) pages[pagesI].set("slideIn", slideInFromRightClass); // "slideInFromRight");
    $homepage.removeClass("fadeIn").addClass("fadeOut");

    crud.set("show");
  } else {
    $home.addClass("myhome-2x");
    $homepage.removeClass("fadeOut").addClass("fadeIn");
    if (pages.length) pages[pagesI].set("slideOut", slideOutClass); // "slideOut");

    crud.set("hide");
  }
};
handleSwipeRight = function(e){
  e.preventDefault();
  e.stopPropagation();
    
  if ($home.hasClass("myhome-2x") || !pages.length) return;
    
  if (pagesI < 0) {
    pagesI = 0;
    pages[0].set("slideIn", slideInClass);        // "slideIn");
  } else {
    pages[pagesI].set("slideOut", slideOutClass); // "slideOut");
    pages[pagesI].set("pagebox-inactivate");
    
    pagesI++;
    if (pagesI > pages.length-1) pagesI = 0;
      
    pages[pagesI].set("slideIn", slideInClass);  // "slideIn");
  }
};
handleSwipeLeft = function(e){
  e.preventDefault();
  e.stopPropagation();
  
  if ($home.hasClass("myhome-2x") || !pages.length) return;
  
  if (pagesI < 0) {
    pagesI = pages.length-1;
    pages[pagesI].set("slideIn", slideInFromRightClass);  // "slideInFromRight");
  } else {
    pages[pagesI].set("slideOut", slideOutToLeftClass);   // "slideOutToLeft");
    pages[pagesI].set("pagebox-inactivate");
    
    pagesI--;
    if (pagesI < 0) pagesI = pages.length-1;
    
    pages[pagesI].set("slideIn", slideInFromRightClass);  // "slideInFromRight");
  }
};
deletePage = function($delButton) {
  let i = $delButton.data("pagesi"), len;
  
  // pages[0].$page.append("i=" + i + "<br>");
  
  pages[i].set("remove");
  pages.splice(i, 1);
  
  len = pages.length;
  if (pagesI > len-1) {
    if (i === pagesI) pagesI = 0;
    else pagesI = len - 1;
  }
  if (i >= len) i = len - 1;
  
  for (; len > 0 && i<len; i++) {
    pages[i].set("pagesI", i); // $frame.children(".del").data("pagesi", "" + i);
  }
};
handleClickDelButton = function(e){
  e.preventDefault();
  deletePage($(this));
};
handleFrameSwipeLeft = function(e, ui) {
  e.preventDefault();
  // pages[0].$page.append("frame-swipe<br>");
  $(this).one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', function(e) {
    e.preventDefault();
    deletePage($(this).children(".del"));
  });
  $(this).addClass("slideOutToLeft");
};
Page = function(args) {
  let
  entity = args.entity, onClickDelButton = args.onClickDelButton, onSwipeLeftFrame = args.onSwipeLeftFrame, myPagesI = args.pagesI, $pageboxes = args.$pageboxes, $homepage = args.$homepage, $home = args.$home,
  
  $delButton = $("<div>", { class:"del" }).html("&times;"),
  $page =      $("<div>", { class:"page" }),
  $pagebox =   $("<li>", { class:"pagebox" }),
  $frame =     $("<div>", { class:"frame" }),

  getVal, setVal;
  
  Component.call(this, args);

  $page.append(entity.$field);
  $frame.html($page.html());  
  $frame.prepend($delButton);
  $delButton.attr("data-pagesi", "" + myPagesI).on("click", onClickDelButton);
  $frame.on("swipe-left", onSwipeLeftFrame);
  
  $page.insertBefore($pageboxes).on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', function(e) {
    e.preventDefault();
    if ($(this).hasClass(slideOutClass) || $(this).hasClass(slideOutToLeftClass)) $(this).addClass("hide");
  });;
  $homepage.append($frame);
  $pagebox.insertBefore($home.parent()); // <ul.pageboxes> <pagebox/> *** inserts here *** <li $home/> <li swipe-left-button/> <li swipe-right-button/> </ul>

  getVal = function(propName) {
    let val;
    
    switch (propName) {
    case "entity":
      val = entity;
      break;
    }
    return val;
  };

  setVal = function(propName, val) {
    switch(propName) {
    case "slideIn":
      $page.removeClass(/* "slideOut slideOutToLeft" */slideOutClass + " " + slideOutToLeftClass + " hide").addClass(val);
      $pagebox.addClass("pagebox-active");
      break;
    case "slideOut":
      $page.removeClass(/* "slideIn slideInFromRight" */slideInClass + " " + slideInFromRightClass).addClass(val);
      break;
    case "pagebox-inactivate":
      $pagebox.removeClass("pagebox-active");
      break;
    case "remove":
      $page.remove();
      $frame.remove();
      $pagebox.remove();	
      break;
    case "pagesI":
      $frame.children(".del").data("pagesi", "" + val);
      break;
    }
  };
  
  this.getVal = getVal;
  this.setVal = setVal;
};
createPage = function(args) {
  let entity = args.entity;
    
  pages.push(new Page({ entity:entity, pagesI:pages.length, $pageboxes:$pageboxes, $homepage:$homepage, $home:$home, onClickDelButton:handleClickDelButton, onSwipeLeftFrame:handleFrameSwipeLeft }));
    
  if (pagesI >= 0) pages[pagesI].set("pagebox-inactivate");
  pagesI++;
};
handleClickMenuItem = function(e, item) {
  let entity;
    
  entity = screens[item] ? new Entity({ fieldName:item, fieldClass:"spruit-screen", screen:screens[item], cal:cal, timepicker:tp, responsive:true, resizeAgent:ra }) : new Entity({ fieldName:item });

  // entity.$pageboxes = $pageboxes; XXX
  // entity.crud = crud; XXX REMOVE?

  entity.load();
  createPage({ entity:entity });
};
init = function(that) {
  Component.call(that, args);
  pages = [];
  pagesI = -1;
  $container = that.$field;
  $homepage = $("<div>", { class:"homepage" });
  $pageboxes = $("<ul>", { class:"pageboxes" });
  $container.append($homepage, $pageboxes);
  $home = $("<i>", { class:"fa fa-home myhome" }).on("click", handleClickHome);

  $pageboxes.append( $("<li>", { class:"navi-button" }).append($home) );
  if (!($.support.touch)) {
    $arrowLeft = $("<i>", { class:"fa fa-arrow-circle-left arrow-swipe" }).on("click", () => { $container.trigger("swipe-left"); return false; });
    $arrowRight = $("<i>", { class:"fa fa-arrow-circle-right arrow-swipe" }).on("click", () => { $container.trigger("swipe-right"); return false; });
    $pageboxes.append( $("<li>", { class:"navi-button" }).append($arrowLeft), $("<li>", { class:"navi-button" }).append($arrowRight) );
  }

  slideInClass =          getAttr(attrs, "slideIn",          "page", "slideInClass"); // attrs:{ page:{ slideInClass:"fadeIn", slideOutClass:"fadeOut", slideInFromRightClass:"fadeIn", slideOutToLeftClass:"fadeOut" }}
  slideOutClass =         getAttr(attrs, "slideOut",         "page", "slideOutClass");
  slideInFromRightClass = getAttr(attrs, "slideInFromRight", "page", "slideInFromRightClass");
  slideOutToLeftClass =   getAttr(attrs, "slideOutToLeft",   "page", "slideOutToLeftClass");
  
  $container.on("swipe-right", (e) => handleSwipeRight(e));
  $container.on("swipe-left", (e) => handleSwipeLeft(e));

  menu = new Menu({ fieldName:"PageManager menu", insertLabel:false, menubar:menubar, dropdown:dropdown, onClickDropdown:(e, item) => handleClickMenuItem(e, item) });
  $homepage.append(menu.$field);

  notif = new Notification({ insertLabel:false });
  crud = new Crud({ insertLabel:false, $pageboxes:$pageboxes, $modalcontainer:$container, attrs:{ modal:{ span:{ style:"z-index:3"} }}, pm:that, notification:notif });
  $container.append(crud.$field, notif.$field);

  cal = new Calendar({ fieldName:"Calendar", $modalcontainer:$container, /* attrs:{ modal:{ span:{ style:"z-index:3"} }}, crud:crud, $pageboxes:$pageboxes */ });
  tp = new TimePicker({ fieldName:"TimePicker", $modalcontainer:$container, /* attrs:{ modal:{ span:{ style:"z-index:3"} }}, $pageboxes:$pageboxes, */ });
  ra = new ResizeAgent({ fieldName:"resizeAgent" });
};
init(this);
getVal = function(propName) {
  switch(propName){
  case "entity":return pages[pagesI].get("entity");
  case "ra":return ra;
  }
};
setVal = function(propName, val) {
  let i;
  
  switch (propName) {
  case "goto-page":
    i = pages.findIndex(page => val === page.get("entity").name);
    // console.log("goto-page, i=" + i + ", name=" + pages[i].get("entity").name);
    if (i > -1) {
      pages[pagesI].set("slideOut", slideOutClass); // "slideOut");
      pages[pagesI].set("pagebox-inactivate");
      pagesI = i;
      pages[pagesI].set("slideIn", slideInClass);   // "slideIn");
    } else {
      notif.set("show", "Broken page-link: " + val);
    }
    break;
  }
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};ResizeAgent = function(args) {
let
view = args.view,
agent,currentWidth,
handleResizeEvent,init,
getVal,setVal,empty,validate,addComponent;
handleResizeEvent = function() {
  let newWidth = mediaQuery();

  if (newWidth !== currentWidth) {
    console.log("ResizeAgent, newWidth=" + newWidth); // XXX
    Object.values(agent.fields).forEach(comp => comp.resize(comp, newWidth));
    currentWidth = newWidth;
  }
};
init = function(that) {
  CustomType.call(that, { fieldName:args.fieldName, fields:{} });

  currentWidth = mediaQuery();
  $(window).on("resize", handleResizeEvent);
  agent = that;
  that.addComponent = addComponent;

  console.log("ResizeAgent, currentWidth=" + currentWidth); // XXX
};
init(this);
getVal = function(propName) {
};
setVal = function(propName, val) {
};
empty = function() {
};
validate = function() {
};
addComponent = function(comp) {
  this.fields["" + Object.values(this.fields).length] = comp;
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
this.addComponent = addComponent;
};Select = function(args) {
let
options = args.options,emptyVal = args.emptyVal,view = args.view,
$options,optionsLen,i,selection,$select,$span,$i,initialVal,valueMap,me,
init,
getVal,setVal,empty,validate;
init = function(that) {
  Component.call(that, args);

  if (view === undefined) {
    $select = $("<ul>", {class:"spruits-select"});
    $options = $("<ul>");
    $i = $("<i>", {class:"fa fa-angle-down"});
    optionsLen = options.length;

    that.$field.append($select);

    if (emptyVal !== undefined) {
      $options.prepend( $("<li>").append( $("<span>",{class:"value"}).html(emptyVal.value), emptyVal.description) );
      if (emptyVal.initial === true) {
        $span = $("<input>").val(emptyVal.value); // $("<span>").html(emptyVal.value);
        initialVal = emptyVal.value;
      }
    }

    if (isArray(options) === true) {
      for (i=0; i<optionsLen; i++) {
        selection = options[i];
        $options.append( $("<li>").append( $("<span>",{class:"value"}).html(selection), Array(selection.length).fill("&nbsp;").reduce((str,val) => str+=val,"") ) );
        if ($span === undefined) {
          $span = $("<input>", { type:"text" }).val(selection); // $("<span>").html(selection);
          initialVal = selection;
        }
      }
    } else {
      valueMap = {};
      for (selection in options) {
        $options.append( $("<li>").append( $("<span>",{class:"value"}).html("" + options[selection]), selection) );
        if ($span === undefined) {
          $span = $("<input>").val(options[selection]); // $("<span>").html(options[selection]);
          initialVal = options[selection];
        }
        valueMap[ ("" + options[selection]) ] = selection;
      }
    }

    $select.append( $("<li>").append(
      $span.addClass("selected"), 
      $("<i>", {class:"fa fa-angle-down"}).on("click", function(e){ $(e.target).next().toggleClass("show"); return false; }),
      $options.on("click", function(e){ 
        let selected = $(e.target).hasClass("value") ? $(e.target).html() : $(e.target).children("span").html(); 
        $span.val(selected); // $(that).prev().prev().html(selected); 
        $options.toggleClass("show");
	$span.trigger("blur");
	return false; 
      })
    ));
  } else { // using another Select's $field
    $span = view.fields[that.name].$field.find(".selected");
    initialVal = view.fields[that.name].get("initialVal");
  }
  me = that;
  $span.on("blur", e => that.handleBlur(e, me));
};
init(this);
getVal = function(propName) {
  switch (propName) {
  case "initialVal":
    // console.log("getVal, initialVal=" + initialVal);
    return initialVal;
    break;
  case "empty":
    return "" + initialVal;
    break;
  default:
    return $span.val(); // html();
  } // switch
};
setVal = function(propName, val) {
  if (val === undefined) {
    $span.val(propName);
  }
  else {
    switch(propName) {
    case "val":
      $span.val(val); // html(val);
      break;
    case "testcaseTemplate":
      template = val.template;
      templateProcessor = val.templateProcessor;     
      break;
    } // switch (propName)
  }
};
empty = function() {
  $span.val(initialVal); // html( initialVal );
};
validate = function() {
  let 
  valid = { valid:true }, value;

  value = this.get("val");

  if (isArray(options) === true) {
  } else {
    if (valueMap[value] === undefined) {
      valid.valid = false;
      valid.invalid = value;
    }
  }

  return valid;
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};Spinner = function(args) {
let
min = args.min,max = args.max,initial = args.initial,padding = args.padding,tailpadding = args.tailpadding,view = args.view,
doTailpadding,doPadding,handleUpClick,handleDownClick,init,
getVal,setVal,empty,validate;
doTailpadding = function(val) {
  if (tailpadding !== undefined) {
    val = (val + tailpadding).slice(0, tailpadding.length);
  }
  return val;
};
doPadding = function(val) {
  let isNegative = false;

  if (padding !== undefined) {
    if (parseInt(val) < 0) {
      isNegative = true;
    }
    val = (padding + Math.abs(val)).slice(-(padding.length + 1));
    if (isNegative === true) {
      val = "-" + val;
    }
  }

  return val;
};
handleUpClick = function(){
  let val = parseInt($(this).next().val());

  if ((max !== undefined && val >= max) || (min !== undefined && val < min) || isNaN(val)) {
    val = min;
  } else {
    val += 1;
  }
  val = doPadding(val);
  val = doTailpadding(val);
  $(this).next().val(val);

  return false; 
};
handleDownClick = function(){
  let val = parseInt($(this).prev().val());

  if ((min !== undefined && val <= min) || (max !== undefined && val > max) || isNaN(val)) {
    val = max;
  } else {
    val -= 1;
  }
  val = doPadding(val);
  val = doTailpadding(val);
  $(this).prev().val(val);

  return false; 
};
init = function(that) {
  if (args.fieldClass === undefined) {
    args.fieldClass = "spruits-spinner";
  }
  Component.call(that, args);

  if (min === undefined) {
    min = 0;
  }
  if (initial === undefined) {
    initial = min;
  }
  initial = doPadding(initial);
  initial = doTailpadding(initial);
  
  that.$field.append(
    $("<div>", {class:"arrow-up"}).on("click", handleUpClick),
    $("<input>").attr(args.attrs.input).val("" + initial), 
    $("<div>", {class:"arrow-down"}).on("click", handleDownClick)
  );
};
init(this);
getVal = function(propName) {
  let val;

  switch(propName) {
  default:
  case "val":
    val = this.$field.children("input").val();
    val = doPadding(val);
    val = doTailpadding(val);
    break;
  }
  return val;
};
setVal = function(propName, val) {
  switch(propName) {
  case "init":
    this.$field.children("input").val("" + initial);
    break;
  default:
  case "val":
    this.$field.children("input").val("" + val);
    break;
  }
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};Table = function(args) {
let
colTitle = args.colTitle,rowNum = args.rowNum,numRows = args.numRows,cellNum = args.cellNum,colTypes = args.colTypes,attrs = args.attrs,responsive = args.responsive,resizeAgent = args.resizeAgent,forceTableview = args.forceTableview,view = args.view,
table,container,currentWidth,
createComponentTable,createTableview,createCustomTypeView,createView,createPositionView,init,
getVal,setVal,empty,validate,resize,setInvalidColor,resetInvalidColor;
createComponentTable = function(colTypes, numRows, container, view) {
    return Array(numRows).fill(null).map((row, rowI) => colTypes.map((col, colI) => { 
      let itemName, colName, colArgsUniq;
      
      colName = ((col.title !== undefined) && (col.title.length)) ? col.title : ("" + colI);
      itemName = rowI + "-" + colName;
      if (view === undefined) {
	colArgsUniq = Object.assign({}, col.args);
        container.createField(itemName, col.type, colArgsUniq);
        return container.fields[itemName];
      } else {
        return new col.type({ fieldName:itemName, view:container });
      }
}))};
createTableview = function(srcArg, $dest, rowNum, colTitle, cellNum, rowTitle, colTitles, colTypes) {
  const $table = $(TABLE);
  let ct = 0, src;
  
  src = colTitle ? [colTitles].concat(srcArg) : srcArg.slice(); // colTitles-array is added as the first line

  if (rowNum === true) {
    $table.addClass("spruit-table-" + (colTitle === true ? "rownum" : "rownum-nocoltitle"));
  } else if (cellNum === true) {
    $table.addClass("spruit-table-cellnum");
  }

  $table.append( src.map((row, i) => { 
    const $tr = $(TR);

    if (colTitle === true && i === 0) {
      ct = 1;
      if (rowTitle !== undefined) $tr.append( $(TH) );
      return $tr.append( row.map((val,i) => $(TH).html(val)));
    } else {
      if (rowTitle !== undefined) $tr.append( $(TD, { class:"spruit-rowtitle" }).html(rowTitle[i - ct]) );
      return $tr.append( row.map((val, colI) => {
	if (colTypes[colI].args.insertLabel !== true) val.$label.html("");
	return $(TD).append(val.$field.attr("class", (colTypes[colI].args.fieldClass === undefined) ? "" : colTypes[colI].args.fieldClass));
      }) ); 
    }} )); // else, =>, src.map, $table.append

  $dest.append($table);
};
createCustomTypeView = function(srcArg, $dest, $label, rowNum, colTitle, cellNum, rowTitle, colTitles) {
  let rowtitle, insertLabel = true;

  if (attrs !== undefined && attrs.rowtitle !== undefined) {
    rowtitle = rowNum ? attrs.rowtitle.map((title, i) => { return ("" + (i+1) + " " + title); }) : attrs.rowtitle;
  } else {
    rowtitle = Array(numRows).fill(null).map((val, i) => { return ("" + (i+1)); });
    if (!rowNum) insertLabel = false;
  }
  srcArg.forEach((row, i) => {
    let cellCounter = "";
    const rowComp = new Component({ fieldName:rowtitle[i], insertLabel:insertLabel, $field:$("<div>", (attrs && attrs.$row) ? attrs.$row : {class:"field-row"}) });
    
    rowComp.$field.append(row.map((comp, colI) => {
      comp.$label.html((cellNum ? (i*row.length + (colI+1)) + " " : "") + (colTitle ? comp.name : ""));
      comp.$field.addClass(DEFAULT_FIELD_CLASS);
      return comp.$field;
    }));
    $dest.append(rowComp.$field);
    rowComp.$label.nextAll().addClass("hide");
    if (insertLabel === false) rowComp.$label.html("&gt;&gt;");
    rowComp.$label.attr("class", "rowtitle").on("click", () => {
      if (insertLabel === false) rowComp.$label.html( ((rowComp.$label.html() === "&gt;&gt;") ? "&lt;&lt;" : "&gt;&gt;") );
      rowComp.$label.nextAll().toggleClass("hide");
      return false;
    });    
  });

  $label.siblings(":last").addClass("last");
  $label.nextAll().addClass("spruits-container padding");
};
createView = function(currentWidth, srcArg, $dest, $label, rowNum, colTitle, cellNum, rowTitle, colTitles, colTypes, forceTableview) {
  (currentWidth || forceTableview) ? createTableview(srcArg, $dest, rowNum, colTitle, cellNum, rowTitle, colTitles, colTypes) : createCustomTypeView(srcArg, $dest, $label, rowNum, colTitle, cellNum, rowTitle, colTitles);
};
createPositionView = function(src, $dest, attrs, colTypes) {
    let 
      positionAttr = attrs.table.position, 
      $table = $(DIV).attr(positionAttr.table ? positionAttr.table : {});

    if (positionAttr.coltitle !== undefined) {
      positionAttr.coltitle.posi.forEach((posi, posiI) => positionAttr.coltitle.titles.forEach((title, titleI) => $table.append($(DIV).html(title).attr({ "style": "position:absolute;" + posi[titleI] })) ));
    }

    $table.append( src.map((row, rowI) => {
      return $(SPAN)
        .attr(isString(positionAttr.tr[rowI]) ? { "style": "position:relative;" + positionAttr.tr[rowI] } : positionAttr.tr[rowI])
        .append(attrs.rowtitle !== undefined ? $(DIV).html(attrs.rowtitle[rowI]).attr({ "style":"position:absolute;" + positionAttr.rowtitle[rowI] }) : [])
        .append(row.map((comp, i) => { 
          let $td = $(DIV);
          if ( positionAttr.td !== undefined) {
            // isString(positionAttr.td[i]) ? comp.$field.attr({ "style":"position:absolute;" + positionAttr.td[i] }) : comp.$field.attr(positionAttr.td[i]);
            $td.attr( isString(positionAttr.td[i]) ? { "style":"position:absolute;" + positionAttr.td[i] } : positionAttr.td[i] );
          }
	  if (colTypes[i].args.insertLabel !== true) comp.$label.html("");
          return $td.append(comp.$field.attr("class", (colTypes[i].args.fieldClass === undefined) ? "" : colTypes[i].args.fieldClass));
      }));
    }));

    $dest.append($table);
};
init = function(that) {
  Component.call(that, args);
  Container.call(that, that.name);
  
  if (view !== undefined) {
    numRows = view.fields[that.name].get("numRows");
    colTypes = view.fields[that.name].get("colTypes");
    container = view.fields[that.name].get("container");
  } else {
    container = that; // new Container();
  }

  table = createComponentTable(colTypes, numRows, container, view);
  currentWidth = mediaQuery();
  if (view === undefined) {
    if (currentWidth && attrs !== undefined && attrs.table !== undefined && attrs.table.position !== undefined && attrs.table.position.create === true) {
      createPositionView(table, that.$field, attrs, colTypes.slice());
    } else {
      createView(currentWidth, table, that.$field, that.$label, rowNum, colTitle, cellNum, (attrs !== undefined) ? attrs.rowtitle : undefined, colTypes.map(val => val.title), colTypes.slice(), forceTableview);
    }
    if (responsive) resizeAgent.addComponent(that);
  }
};
init(this);
getVal = function(propName) {
  switch(propName) {
  default:
    return table.map(row => {
      let val=[];
      row.forEach((comp, i) => { if (colTypes[i].ignore !== true) val.push(comp.get("val")); });
      return val;
    });
    // return table.map(row => row.map(comp => comp.get("val")));
    break;
  case "empty":
    return table.map(row => {
      let val=[];
      row.forEach((comp, i) => { if (colTypes[i].ignore !== true) val.push(comp.get("empty")); });
      return val;
    });
    // return table.map(row => row.map(col => col.get("empty")));
    break;
  case "numRows":
    return numRows;
    break;
  case "colTypes":
    return colTypes;
    break;
  case "container":
    return container;
    break;
  } // switch
};
setVal = function(propName, val) {
  if (val === undefined) {
    val = propName;
    propName = "val"; // table.forEach((row, rowI) => row.forEach((col, colI) => col.set("val", propName[rowI][colI])));
  }

  switch(propName) {
  case "val":
    // table.forEach((row, rowI) => row.forEach((col, colI) => col.set("val", val[rowI][colI])));
    for (let rowI=0; rowI<table.length; rowI++) {
      let row = table[rowI];
      for (let colI=0, valI=0; colI<row.length; colI++) {
	if (colTypes[colI].ignore !== true) {
	  row[colI].set("val", val[rowI][valI]);
	  valI++;
	}
      }
    }
    break;
  case "testcaseTemplate":
    template = val.template;
    templateProcessor = val.templateProcessor;     
    break;
  } // switch (propName)
};
empty = function() {
  table.forEach(row => row.forEach((comp, colI) => { if (colTypes[colI].ignore !== true) comp.empty() }));
};
validate = function() {
  let
  compValid, valid = { valid:true };

  table.forEach((row, rowI) => row.forEach((comp, colI) => {
    if (colTypes[colI].ignore !== true) {
      compValid = comp.get("valid");
      if (compValid.valid === false) {
	valid.valid = false;
	if (valid.invalid === undefined) {
          valid.invalid = [];
	}
	valid.invalid.push({ rowI:rowI, colI:colI, value:compValid.invalid });
      }
    }
  }));
  return valid;
};
resize = function(comp, newWidth) {
  console.log("resize, comp.name=" + comp.name);
  comp.$label.nextAll().detach();
  if (attrs && isFunction(attrs.span)) this.$field.attr(attrs.span());
  if (newWidth && attrs !== undefined && attrs.table !== undefined && attrs.table.position !== undefined && attrs.table.position.create === true) {
    createPositionView(table, this.$field, attrs, colTypes.slice());
  } else {
    createView(newWidth, table, this.$field, this.$label, rowNum, colTitle, cellNum, (attrs !== undefined) ? attrs.rowtitle : undefined, colTypes.map(val => val.title), colTypes.slice(), forceTableview);
  }
};
setInvalidColor = function(propName, val) { // val = [{"rowI":0,"colI":0,"value":"q-w"}]
  val.forEach(cell => table[cell.rowI][cell.colI].set("invalid-color", cell.value))
};
resetInvalidColor = function(propName, val) {
  Object.values(container.fields).forEach(comp => comp.set("reset-invalid-color"))
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
this.resize = resize;
this.setInvalidColor = setInvalidColor;
this.resetInvalidColor = resetInvalidColor;
};TabSheet = function(args) {
let
fields = args.fields,tabs = args.tabs,sheetName = args.sheetName,createScreen = args.createScreen,attrs = args.attrs,$modalcontainer = args.$modalcontainer,$pageboxes = args.$pageboxes,crud = args.crud,responsive = args.responsive,resizeAgent = args.resizeAgent,view = args.view,
sheetContainer,comps,sheets,$sheetName,$legend,$fieldset,$buttons,modal,currentWidth,screenResizeFunc,sheetValidator,validatorComps,
Sheet,useModal,handleTabButtonClick,init,
getVal,setVal,empty,validate,resize,setInvalidColor,resetInvalidColor;
Sheet = function(args) {
  let
  $sheetName = args.$sheetName, comps = args.comps, validatorComps = args.validatorComps,
  val, invalid,
  getVal, setVal, empty, validate;

  getVal = function(propName){
    switch(propName) {
    case "val":
    default:
      if (this.name === $sheetName.html() /* current */) {
	val = {};
	comps.forEach(comp => { val[comp.name] = comp.get("val"); });
      } else {
	if (val === undefined) {
	  val = {};
	  comps.forEach(comp => { val[comp.name] = comp.get("empty"); });
	}
      }
      return val;
      break;
    case "empty":
      val = {};
      comps.forEach(comp => { val[comp.name] = comp.get("empty"); });
      return val;
      break;
    }
  }; // getVal

  setVal = function(propName, valArg) {
    switch(propName){
    case "invalid-color":
      if (valArg) invalid = valArg;
      if (invalid) {
	if (this.name === $sheetName.html()) { // current sheet
	  Object.keys(invalid).forEach(fieldName => {
	    let comp = comps.find(comp => comp.name === fieldName);
	    if (comp) comp.set("invalid-color", invalid[fieldName]);
	  });
	}
      } else {
	comps.forEach(comp => comp.set("reset-invalid-color"));
      }
      break;
    case "reset-invalid-color":
      if (invalid) {
	if (this.name === $sheetName.html()) { // current sheet
	  comps.forEach(comp => comp.set("reset-invalid-color"));
	}
	invalid = undefined;
      }
      break;
    case "val":
    default:
      val = valArg;
      if (this.name === $sheetName.html() /* current */) {
	comps.forEach(comp => comp.set("val", val[comp.name]));
      }
      break;
    }
  }; // setVal

  empty = function(){
    this.getVal("empty"); // XXX
  };

  validate = function() {
    let val = this.getVal("val"), compValid, valid = { valid:true };
    
    validatorComps.forEach(comp => {
      comp.set("val", val[comp.name]);
      
      compValid = comp.get("valid");
      if (compValid.valid === false) {
	valid.valid = false;
	if (valid.invalid === undefined) valid.invalid = {};
	valid.invalid[comp.name] = compValid.invalid;
      }
    });

    return valid;
  };

  this.name = args.name;

  this.getVal = getVal;
  this.setVal = setVal;
  this.empty = empty;
  this.validate = validate;
};
useModal = function() {
  return (($modalcontainer === undefined) || currentWidth) ? false : true;
};
handleTabButtonClick = function(event, $tabName, sheetName) { 
  let current = $tabName.html(), sheet, val;

  event.preventDefault();
  if (!useModal() && current === sheetName) return; // No action when the clicked sheet is already in the dom sheet.

  if (current.length) {
    // Store the dom sheet to the current sheet.
    sheet = sheets.find((sheet) => { return (sheet.name === current) });
    sheet !== undefined ? sheet.getVal("val") : console.log("HanleTabButtonClick, store view: sheet undefined, " + current);
  }

  // Set the dom sheet to show the clicked sheet and set it as current.
  sheet = sheets.find(sheet => sheet.name === sheetName);
  if (sheet) {
    val = sheet.getVal("val");
    $tabName.html(sheetName); // Dom components are set by sheet.setVal(), because the current sheet equals to sheet.name.
    sheet.setVal("val", val);
    sheet.setVal("invalid-color");
    if (useModal()) modal.set("show");
  } else {
    console.log("HandleTabButtonClick, set view: sheet undefined, " + sheetName);
  }
};
init = function(that) {
  Component.call(that, args);
  Container.call(that, that.name);
  
  sheetValidator = new Container(that.name);

  if (view === undefined) {
    sheetContainer = that;
    fields.forEach(field => {
      sheetContainer.createField(field[0], field[1], field[2]);
      sheetValidator.createField(field[0], field[1], field[2]);
    });
    comps = Object.values(sheetContainer.fields);
    validatorComps = Object.values(sheetValidator.fields);

    currentWidth = mediaQuery();
    
    $sheetName = $("<span>").html("");
    $legend =    $("<legend>").append(sheetName, $sheetName);
    $fieldset =  $("<fieldset>").append($legend).attr((attrs && attrs.fieldset) ? (isFunction(attrs.fieldset) ? attrs.fieldset() : attrs.fieldset) : {});
    $buttons = tabs.map(name => { return $("<button>").html(name).on("click", (e) => handleTabButtonClick(e, $sheetName, name)); }); // XXX (attrs && attrs.buttons && attrs.buttons.button) ? attrs.buttons.button[name] : {}
    that.$field.append( $("<div>").css("padding-top","0.5em").append($buttons).attr((attrs && attrs.buttons && attrs.buttons.div) ? attrs.buttons.div : { class:"tabsheet-buttons" }), useModal() ? "" : $fieldset); 
    screenResizeFunc = createScreen($fieldset, comps);

    modal = new Modal({ fieldName:that.name, "$modalbody":useModal() ? $fieldset : undefined, id:getId("spruits-ts"), $container:$modalcontainer, attrs:attrs ? attrs.modal : undefined, $pageboxes:$pageboxes, crud:crud });
    
    sheets = tabs.map(name => { return new Sheet({ name:name, $sheetName:$sheetName, comps:comps, validatorComps:validatorComps }) });
    if (!useModal()) $buttons[0].trigger("click");
    if (responsive) resizeAgent.addComponent(that);
  } else {
    tabs = view.fields[that.name].getVal("tabs");
    comps = view.fields[that.name].getVal("comps");
    $sheetName = view.fields[that.name].getVal("$sheetName");
    sheets =   tabs.map(name => { return new Sheet({ name:name, $sheetName:$sheetName, comps:comps }) });
  }
};
init(this);
getVal = function(propName) {
  let val = {};
  
  switch(propName) {
  case "val":
  default:
    sheets.forEach(sheet => { val[sheet.name] = sheet.getVal("val"); } );
    return val;
  case "empty":
    sheets.forEach(sheet => { val[sheet.name] = sheet.getVal("empty"); } );
    return val;
  case "tabs": return tabs;
  case "comps": return comps;
  case "$sheetName": return $sheetName;
  }
};
setVal = function(propName, val) {
  if (!val) {
    val = propName;
    propName = "val";
  }
  switch(propName) {
  case "val":
    sheets.forEach(sheet => { sheet.setVal("val", val[sheet.name]) });
    break;
  default:
    console.log("*** TabSheet.setVal, default, name=" + this.name + ", propName=" + propName + ", val=" + JSON.stringify(val));
    break;
  }
};
empty = function() {
  sheets.forEach(sheet => sheet.empty());
};
validate = function() {
  let
  sheetValid, valid = { valid:true };

  sheets.forEach(sheet => {
    sheetValid = sheet.validate();
    if (sheetValid.valid === false) {
      valid.valid = false;
      if (valid.invalid === undefined) {
        valid.invalid = {};
      }
      valid.invalid[sheet.name] = sheetValid.invalid;
    } 
  });
  
  return valid;
};
resize = function(comp, newWidth) {
  let currentMode, newMode;
  
  if (newWidth !== currentWidth) {
    currentMode = useModal();
    currentWidth = newWidth;
    newMode = useModal();
    if (newMode !== currentMode) {
      $fieldset.attr((attrs && attrs.fieldset) ? (isFunction(attrs.fieldset) ? attrs.fieldset() : attrs.fieldset) : {}); // XXX create function for attrs
      if (newMode === true) {
	modal.set("$modalbody", $fieldset);
      } else {
	modal.set("close");
	this.$field.append($fieldset);
	$buttons[0].trigger("click");
      }
      if (screenResizeFunc) screenResizeFunc($fieldset);
    }
  }
};
setInvalidColor = function(propName, val) { // val={ sheetName:{ fieldName:invalid-value } }, example: {"17":{"Price List ID":"ss17-prli"}}
  Object.keys(val).forEach(sheetName => {
    let
    $tabButton = $buttons.find($button => $button.html() === sheetName),
    sheet = sheets.find(sheet => sheet.name === sheetName);
    if ($tabButton) $tabButton.addClass("invalid");
    if (sheet) sheet.setVal("invalid-color", val[sheetName]);
  });
};
resetInvalidColor = function(propName, val) {
  $buttons.forEach($button => $button.removeClass("invalid"));
  sheets.forEach(sheet => sheet.setVal("reset-invalid-color"));
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
this.resize = resize;
this.setInvalidColor = setInvalidColor;
this.resetInvalidColor = resetInvalidColor;
};TimePicker = function(args) {
let
$modalcontainer = args.$modalcontainer,attrs = args.attrs,$pageboxes = args.$pageboxes,view = args.view,
mode,hh,mm,ss,micros,$dest,modalId,modal,modalAttrs,
setMode,handleClickOk,init,
getVal,setVal,empty,validate;
setMode = function(m) {
  let microsOffset, fontSize, marginTop;
  
  hh.set("init");
  mm.set("init");

  switch (m) {
  default:
  case "hhmm":
    ss.$field.addClass("hide");
    micros.$field.addClass("hide");
    break;
  case "hhmmss":
    ss.set("init");
    ss.$field.removeClass("hide");
    micros.$field.addClass("hide");
    break;  
  case "hhmmssmicros":
    ss.set("init");
    micros.set("init");
    ss.$field.removeClass("hide");
    micros.$field.removeClass("hide");
    
    /* XXX kludge micros' look */
    fontSize = ss.$field.children(".arrow-up").css("fontSize");
    fontSize = parseInt(fontSize.slice(0, fontSize.length-2));
    marginTop = ss.$field.children("input").css("marginTop");
    marginTop = parseInt(marginTop.slice(0, marginTop.length-2));
    marginTop = (fontSize+marginTop) + "px";
    micros.$field.children("input").css("margin-top", marginTop);
    micros.$field.height( ss.$field.height() );
    microsOffset = micros.$field.offset();
    microsOffset.top = ss.$field.offset().top;
    micros.$field.offset(microsOffset);
    break;  
  }
  mode = m;
};
handleClickOk = function(){
  $dest.val(getVal());
  modal.set("close");
  return false;
};
init = function(that) {
  mode = "hhmm"; /* configures the spinners which are visible. Optional. */

  if (args.fieldClass === undefined) {
    args.fieldClass = "spruits-timepicker";
  }
  args.insertLabel = false;
  if (args.mode !== undefined) {
    if (Modes[args.mode] === true) {
      mode = args.mode;
    }
  }

  Component.call(that, args);

  hh = new Spinner({ fieldName:"hh", attrs:{ input:{ class:"numdigits-2", maxlength:"2"}}, min:0, max:24, padding:"0" });
  mm = new Spinner({ fieldName:"mm", attrs:{ input:{ class:"numdigits-2", maxlength:"2"}}, min:0, max:59, padding:"0" });
  ss = new Spinner({ fieldName:"ss", attrs:{ input:{ class:"numdigits-2", maxlength:"2"}}, min:0, max:59, padding:"0" });
  micros = new Spinner({ fieldName:"micros", attrs:{ input:{ class:"numdigits-6", maxlength:"6"}}, min:0, max:999999, tailpadding:"000000" });
  micros.$field.children(".arrow-up, .arrow-down").addClass("hide");

  that.$field.append( 
    $("<div>", {class:"timepicker-container"}).append(
      hh.$field,
      mm.$field,
      ss.$field,
      micros.$field
    ),
    $("<div>", {class:"ok-container"}).append( $("<span>", {class:"ok"}).html("Ok") ).on("click", handleClickOk)
  );

  if (attrs !== undefined) {
    modalAttrs = attrs.modal;
  }
  modalId = getId("spruits-timepicker");
  modal = new Modal({ fieldName:"TimePicker", "$modalbody":that.$field, id:modalId, $container:$modalcontainer, attrs:modalAttrs, $pageboxes:$pageboxes, attrs:{span:{style:"z-index:10;"}} });

  setMode(mode);
};
init(this);
getVal = function(propName) {
  let val;

  switch (mode) {
  default:
  case "hhmm":
    val = hh.get() + ":" + mm.get();
    break;
  case "hhmmss":
    val = hh.get() + ":" + mm.get() + ":" + ss.get();
    break;  
  case "hhmmssmicros":
    val = hh.get() + ":" + mm.get() + ":" + ss.get() + "." + micros.get();
    break;  
  }
  return val;
};
setVal = function(propName, val) {
  switch(propName) {
  case "spinners":
    setMode(val);
    break;
  case "$dest":
    $dest = val;
    break;
  case "label":
    //this.$label.html(val);
    modal.set("$title", val);
    break;
  case "show":
    modal.set("show"); // $field.css("display", "block");
    // modal.$field.find(".modal-content").removeClass("modalout").addClass("modalin");
    break;
  }; // switch
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};TouchManager = function(args) {
let
touch,log,
isSwipe,handleTouchStart,handleTouchMove,handleTouchEnd,handleTouchCancel,init,
getVal,setVal,empty,validate;
isSwipe = function(touch) {
  let 
  duration, distanceX, distanceY, moves, numMoves, result, oneDirection, direction;
  
  oneDirection = function(moves, numMoves) {
    let prevX, prevY, i, horizontal, minY, maxY;

    if (numMoves <= 1) {
      return { horizontal:{ oneDirection:false } };
    }
    prevX = moves[0].x;
    minY = moves[0].y;
    maxY = minY;
    if (moves[1].y < minY) {
      minY = moves[1].y;
    } else if (moves[1].y > maxY) {
      maxY = moves[1].y;
    }
    if (prevX <= moves[1].x) {
      horizontal = { right:true, oneDirection:true };
      
      for (i=2; i<numMoves; i++) {
        if (prevX > moves[i].x) {
          horizontal.oneDirection = false;
          break;
        }
        prevX = moves[i].x;
	
        if (moves[i].y < minY) {
          minY = moves[i].y;
        } else if (moves[i].y > maxY) {
          maxY = moves[i].y;
        }
      } // for (i)
    } else {
      horizontal = { right:false, oneDirection:true };
      
      for (i=2; i<numMoves; i++) {
        if (prevX < moves[i].x) {
          horizontal.oneDirection = false;
          break;
        }
        prevX = moves[i].x;
	
        if (moves[i].y < minY) {
          minY = moves[i].y;
        } else if (moves[i].y > maxY) {
          maxY = moves[i].y;
        }
      } // for (i)
    } // horizontal -> left
    
    horizontal.verticalAltitude = Math.abs(minY - maxY);
    
    return { horizontal:horizontal };
  }; // oneDirection()

  moves = touch.moves;
  duration = touch.end.time - touch.start.time;
  distanceX = parseInt(touch.start.x - touch.end.x);
  distanceY = parseInt(touch.start.y - touch.end.y);
  
  result = (duration < 500);
  if (result &&
      (result = ((distanceX = Math.abs(distanceX))<300)) &&
      (result = (distanceX >= 30)) &&
      (result = ((numMoves = moves.length) <= 21)) &&
      (result = (numMoves > 0))) {

    direction = oneDirection(moves, numMoves);
    if ((result=direction.horizontal.oneDirection) &&
        (result=(direction.horizontal.verticalAltitude<30))) {
    }
  }
  
  return { result:result, horizontal: direction.horizontal };
};
handleTouchStart = function(e) {
  touch = {
    start: { time: Date.now(),
             x: e.changedTouches[0].screenX,
             y: e.changedTouches[0].screenY,
             numT:e.changedTouches.length
           },
    moves: []
  };
};
handleTouchMove = function(e) {
  touch.moves.push({ time: Date.now(),
		     x: e.changedTouches[0].screenX,
		     y: e.changedTouches[0].screenY,
		     numT: e.changedTouches.length
		   });
};
handleTouchEnd = function(e) {
  let swipe;
  
  touch.end = {
    time:Date.now(),
    x: e.changedTouches[0].screenX,
    y: e.changedTouches[0].screenY,
    numT:e.changedTouches.length
  };
  swipe = isSwipe(touch);
  if (swipe.result === true) {
    if (swipe.horizontal.right === true) {
      if (log !== undefined) {
        log.append("swipe-right<br>");
      }
      $(e.target).trigger("swipe-right");
    } else {
      if (log !== undefined) {
        log.append("swipe-left<br>");
      }
      $(e.target).trigger("swipe-left");
    }
  }
};
handleTouchCancel = function(e){
  if (log !== undefined) {
    log.append("Tcancel");
  }
};
init = function(that) {
  Component.call(that, args);
  
  $("body")
    .on("touchstart",  handleTouchStart)
    .on("touchmove",   handleTouchMove)
    .on("touchend",    handleTouchEnd)
    .on("touchcancel", handleTouchCancel);
};
init(this);
getVal = function(propName) {
};
setVal = function(propName, val) {
  switch (propName) {
  case "$log":
    log = val;
    break;
  } // switch
};
empty = function() {
};
validate = function() {
};
this.getVal = getVal;
this.setVal = setVal;
this.empty = empty;
this.validate = validate;
};//****************************************************************************************************************************************************************************
wc = function(comp) {
  let result = false;
  
  if (this[comp.prototype.constructor.name] === undefined) {
    this[comp.prototype.constructor.name] = comp;
    result = true;
  }

  return result;
};

//****************************************************************************************************************************************************************************
addCssRules = function (rules, $dest, pretty) {
  let selector, propsObj, propsStr; // , dest = [];

  /*
  rules.forEach(rule => {
    selector = Object.keys(rule)[0];
    propsObj = Object.values(rule)[0];
    propsStr = Object.entries(propsObj).reduce((all, propAndVal) => { return all + (pretty ? "  ":"") + propAndVal[0] + ":" + propAndVal[1] + (pretty ? "\n":" "); }, "");
    dest.push(selector + ' {' + (pretty ? '\n':' ') + propsStr + '}\n');
  });
  */
  if ($dest) $dest.append(rules);

  return rules; // dest;
}

//****************************************************************************************************************************************************************************
addCssRule = function(rule) {
  let rules = [];
  rules.push(rule);
  return addCssRules(rules, $("#spruits-app-styles"));
}

return {
  TABLE: TABLE,
  TH:    TH,
  TR:    TR,
  TD:    TD,
  DIV:   DIV,
  SPAN:  SPAN,
  INPUT: INPUT,
  I:     I,
  DEFAULT_FIELD_CLASS:DEFAULT_FIELD_CLASS,

  isArray:            isArray,
  isFunction:         isFunction, 
  isString:           isString, 
  getId:              getId,
  mediaQuery:         mediaQuery,
  getAttr:            getAttr,
  
  Component:          Component,
  InputText:          InputText,
  AlphaNumericString: AlphaNumericString,
  DigitString:        DigitString,
  DecimalDigitString: DecimalDigitString,
  InputCheckbox:      InputCheckbox, 
  Select:             Select,
  Modal:              Modal,
  Calendar:           Calendar,
  InputDate:          InputDate,
  Modes:              Modes,
  Spinner:            Spinner,
  TimePicker:         TimePicker,
  InputTime:          InputTime,
  InputDateAndTime:   InputDateAndTime,
  ResizeAgent:        ResizeAgent,
  Table:              Table,
  TabSheet:           TabSheet, 
  CustomType:         CustomType,
  Entity:             Entity,
  Container:          Container,
  Menu:               Menu,
  Notification:       Notification,
  Crud:               Crud,
  PageManager:        PageManager,
  TouchManager:       TouchManager,
  init:               init,
  wc:                 wc,
  addCssRules:        addCssRules,
  addCssRule:         addCssRule,
};

}());
