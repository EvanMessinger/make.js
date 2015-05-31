/*
* Relies:
*
* Jquery
* Underscore
* Ring
*
*/

function extend(obj, propName, func){
  if(typeof propName !== "string")
    $.each(propName, function(key, value){
      extend(obj, key, value);
    });
  Object.defineProperty(obj, propName, {
    value: func,
    writable: true,
    configurable: true,
    enumerable: false
  });
}

extend(String.prototype, {

  reverse: function(){
    regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uDC00-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])([\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
    regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;
    unreversed = this.replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
        return $2.reverse() + $1;
    }).replace(regexSurrogatePair, '$2$1');
    result = "";
    index=unreversed.length;do{
      result += unreversed.charAt(index);
    }while(index-- > 0);
    brackets = {
      "(": ")",
      "{": "}",
      "[": "]",
      "<": ">"
    };
    $.each(brackets, function(key, value){
      result = result.replace(key, value);
    });
    return result;
  },

  prefix: function(prefix){
    prefix = String(prefix);
    return prefix + this;
  },

  contains: function(substring){
    return this.indexOf(substring) > -1;
  },

  splice: function(index, remove, string){
    return this.slice(0, index) + string + this.slice(index + Math.abs(remove));
  },

  wrap: function(wrapper, tag){
    if(tag) return this.prefix(wrapper)+wrapper.splice(1, 0, "/");
    return this.prefix(wrapper)+wrapper.reverse();
  },

  parens: function(){
    return this.wrap("(");
  },

  stringify: function(){
    return this.wrap("'");
  },

  url: function(){
    return this.stringify().parens().prefix("url");
  }

});

extend(Object.prototype, {

  isDictionary: function(){
    if(!this) return false;
    if(this.isArray()) return false;
    if(this.constructor != Object) return false;
    return true;
  },

  isArray: function(){
    return Array.isArray(this);
  },

  is: function(something){
    return Object.is(this, something);
  },

  matches: function(something){
    if(typeof something === "undefined") return false;
    if(this.is(something)) return true;
    j=0;do{
      if(typeof something[something.keys()[j]] === "undefined" || this[this.keys()[j]] !== something[something.keys()[j]]) return false;
      return true;
    }while(++j<this.keys().length);
  },

  toArray: function(){
    if(!this.isDictionary()) return [this];
    return this.values();
  },

  has: function(property){
    return typeof this[property] !== "undefined";
  },

  keys: function(){
    array = [];
    i=0;do{
      array[i] = Object.keys(this)[i]
    }while(++i<Object.keys(this).length);
    return array;
  },

  values: function(){
    if(!this.isDictionary()) return;
    keys = this.keys();
    values = [];
    keys.forEach(function(key){
      values.push(this[key]);
    });
    return values;
  },

  keysOf: function(value){
    return this.invert()[value];
  },

  invert: function(){
    if(!this.isDictionary()) return;
    comparitor = [];
    multiples = {};
    values = this.values();
    keys = this.keys();
    index=0;do{
      if(comparitor.contains(values[index])){
        if(typeof multiples[values[index]] === "undefined"){
          multiples[values[index]] = [keys[index]];
          multiples[values[index]].splice(0, 0, keys[values.indexOf(values[index])]);
        }else{
          multiples[values[index]].add(keys[index]);
        }
      }else{
        comparitor.add(values[index]);
      }
    }while(++index<values.length);
    comp=0;do{
      if(typeof multiples[comparitor[comp]] === "undefined")
        multiples[comparitor[comp]] = keys[values.indexOf(comparitor[comp])];
    }while(++comp<comparitor.length);
    return multiples;
  }
});

extend(Math, {

  clamp: function(value, min, max){
    return Math.min(Math.max(value, min), max);
  },

  range: function(min, max){
    array = Array.apply(null, Array(Math.abs(max-min+1))).map(function (_, i) {return i;});
    index=0;do{
      array[index] += min;
    }while(++index<array.length);
    return array;
  },

  roundTo: function(value, step){
    return Math.round(value/step)*step;
  },

  rndint: function(min, max){
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

});

extend(Array.prototype, {

  isEmpty: function(){
    return this.length < 1;
  },

  empty: function(){
    this.length = 0;
  },

  toHash: function(){
    //fixme: undefined
    keys = this.keys();
    hash = {};
    index=0;do{
      hash[index] = this[index];
    }while(++index<this.length);
    return hash;
  },

  contains: function(item){
    return this.indexOf(item) > -1;
  },

  containsMatch: function(item){
    i=0;do{
      if(typeof this[i] !== "undefined" && this[i].matches(item)) return true;
    }while(++i<this.length);
    return false;
  },

  where: function(rule){
    which = [];
    this.forEach(function(element){ if(rule(element)) which.push(element); });
    return which;
  },

  containsWhere: function(rule){
    contains = false;
    this.forEach(function(element){ if(rule(element)) contains = true; });
    return contains;
  },

  elementsWith: function(attributes){
    var which = [];
    this.forEach(function(element){
      var match = true;
      attributes.keys().forEach(function(key){
        if(!element.has(key) || element[key] !== attributes[key]) match = false;
      });
      if(match) which.push(element);
    });
    return which;
  },

  modify: function(rule){
    index=0;do{
      this[index] = rule(this[index]);
    }while(++index < this.length);
    return this;
  },

  modifyWhere: function(where, mod){
    return this.where(where).modify(mod);
  },

  doWhere: function(where, task){
    this.where(where).forEach(function(element){ task(element); });
  },

  removeWhere: function(where){
    var index = 0;do{
      if(where(this[index])) this.splice(index, 1);
    }while(++index < this.length);
    return this;
  },

  removeAfter: function(item){
    index = this.indexOf(item)+1;
    return this.splice(index, this.length-index);
  },

  cat: function(item){
    array = item.isArray()? item : arguments;
    index=0;do{
      this.push(array[index]);
    }while(++index<array.length);
    return this;
  },

  random: function(){
    return this[Math.rndint(0, this.length-1)];
  },

  removeDupes: function(){
    var array = [];
    this.forEach(function(element){
      if(!array.contains(element)) array.push(element);
    });
    return array;
  },

  between: function(start, end){
    var array = [];
    var index = start;do{
      array.push(this[index]);
    }while(++index < end+1);
    return array;
  },

  sortBy: function(rule){
    sorted = this;
    sorted.sort(function(a, b){
      if (a == b) return 0;
      return rule(a, b) ? -1 : 1;
    });
    return sorted;
  },

  first: function(){
    return this[0];
  },

  last: function(){
    return this[this.length-1];
  }

});

function comma(){
  return ", ";
}

function colon(){
  return ": ";
}

function space(){
  return " ";
}

function collision($div1, $div2) {
  var x1 = $div1.offset().left;
  var y1 = $div1.offset().top;
  var h1 = $div1.outerHeight(true);
  var w1 = $div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = $div2.offset().left;
  var y2 = $div2.offset().top;
  var h2 = $div2.outerHeight(true);
  var w2 = $div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
  return true;
};

Parent = ring.create({
  constructor: function(name, klass, props){
    this.name = name;
    this.klass = klass;
    this.div = $("<div />", {
      id: this.name,
      class: klass.toLowerCase()
    });
    $.extend(this, props);
    if(this.has("container") && this.container){
      this.container = $("<div />", {
        class: "container",
        id: this.name
      });
      toAppend = this.container;
      this.div.appendTo(this.container);
    }else{
      toAppend = this.div;
    }
    if(this.has("section")){
      toAppend.appendTo(this.section);
    }else{
      toAppend.appendTo($(document.body));
    }
    if(this.has("css")){
      //fixme: make some rules apply to all children
      switch(true){
        case (this.has("container") && this.css.has("container")):
          this.container.css(this.css.container);
          break;
        case (this.css.has("div")):
          this.div.css(this.css.div);
          break;
        default:
          this.div.css(this.css);
          break;
      }
    }
    this.make();
    this.div.click(this.click);
    this.div.mousedown(this.mousedown);
    this.div.mouseup(this.mouseup);
    this.makeChildren();
  },
  make: function(){
  },
  click: function(){
  },
  makeChildren: function(){
    if(this.has("children")){
      makeByHash(this.children, { klass: this.klass });
      names = this.children.keys();
      name=0;do{
        child = window[names[name]];
        child.div.detach().appendTo(this.div);
      }while(++name<names.length);
    }
  }
});

Container = ring.create([Parent], {});

function makeByName(name, klass, options){
  return (window[name] = make(name, klass, options));
}

function makeByHash(hashName, options, key){
  var hash = typeof hashName === "string"? window[hashName]: hashName;
  compose = function(key, value){
    name = value.has("name")? value.name : key;
    if (name === "klass" || name[0] === "_") return;
    if (value.has("klass") && typeof options !== "undefined" && options.has("klass")) delete options.klass;
    $.extend(value, options);
    switch(true){
      case (hash.has("klass")):
        klass = hash.klass;
        break;
      case (value.has("klass")):
        klass = value.klass;
        break;
      case (typeof hashName === "string"):
        klass = hashName.singularize().capitalize();
        break;
      default:
        klass = "Parent";
        break;
    }
    return (window[key] = make(name, klass, value));
  }
  if(typeof key === "undefined" || !key){
    var keys = hash.keys();
    if(keys.length === 1){
      return compose(keys[0], hash[keys[0]]);
    }else{
      array = [];
      $.each(hash, function(key, value){
        array.push(compose(key, value));
      });
      return array;
    }
  }else{
    return compose(key, hash[key]);
  }
}

function makeByArray(array, klass, options){
  returnArray = [];
  array = typeof array === "string"? window[array] : array;
  options = typeof options === "undefined"? {} : options;
  index=0;do{
    oldOptions = options;
    $.extend(options, array[index]);
    returnArray[index] = make(index, klass, options);
    options = oldOptions;
  }while(++index<array.length);
  return returnArray;
}

function makeByRepetition(number, name, options){
  var klass = name.singularize().capitalize();
  var array = [];
  var index=0;do{
    array[index] = make(index, klass, options);
  }while(++index<number);
  return array;
}

function make(name, klass, props){
  return new window[klass](name, klass, props);
}
