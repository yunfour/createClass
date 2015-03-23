
/**
 * @author: yunfour
 * @email: yunfour@163.com
 * @version: 0.0.1
 */

define(function (require, exports, module) {
    
    /**
     * @param {Object} targetObj 对象、数组类型；必填；如果只有这一个参数，则返回值为该对象的克隆版本的对象
     * @param {Object} obj 对象；选填；如果设置了该参数，则会将该对象的属性复制到目标对象targetObj上，然后返回targetObj
     * @description 克隆对象，可以将obj的属性复制到目标对象targetObj，也可以也可以单独克隆一个对象
     */
    function cloneObj(targetObj, obj) {
        
        var result;
        
        if(typeof obj === 'object') {
            
            for(var k in obj) {
                
                // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                if(k !== 'prototype') {
                    
                    targetObj[k] = obj[k];
                }
            }
            
            result = targetObj;
        } else {
            
            if(typeof targetObj === 'object') {
                
                if(targetObj.constructor === Array) {
                    
                    result = targetObj.slice();
                } else {
                    
                    result = {};
                    
                    for(var kk in targetObj) {
                        
                        // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                        if(kk !== 'prototype') {
                            result[kk] = targetObj[kk];
                        }
                    }
                }
            } else {
                
                result = targetObj;
            }
        }
        
        return result;
    }
    
    
    /**
     * @param {Object} conf 对创建的构造函数进行配置；可选；参数 conf 支持的属性如下：
     *      attrs: {Object} 初始私有属性；可选
     *      superClass: {Function/Array} 设置父类，可以是一个构造函数，也可以是多个构造函数组成的数组（继承多个类）
     *      init: {Function} 实例化对象是对实例初始化函数
     *      methods: {Object} 该类拥有的方法，即：设置类原型链上的方法
     * 
     * @description 通过该函数可以创建一个类/构造函数，该函数实现了类的（多）继承、私有变量的管理。通过该函数创建的类的实例，都会拥有三个共同的方法：setAttr()、setAttr()、instanceOf()，前两个方法是对实例的私有属性的管理，instanceOf()方法是判断继承关系
     * 
     */
    function createClass(conf) {
        
        conf = conf || {};
        
        // 所有的方法
        var methods      = conf.methods,
            superClasses = conf.superClass;
        
        // 定义构造函数
        function Constructor() {
            
            var that = this;
            
            /**
             * 私有属性对象（集合），将私有属性集合放在构造函数中的闭包环境中，通过
             * setAttr()、getAttr() 两个方法对attrs存取操作，这样可以保护私有变
             * 量，达到封装的目的
             */
            var attrs = {};
            
            var __superClasses = [];
            
            // 判断是否设置了父类
            if(superClasses && superClasses.constructor === Array) {
                
                for(var i = 0, l = superClasses.length, superClass; i < l; i ++) {
                    
                    superClass = superClasses[i];
                    
                    if(typeof superClass === 'function') {
                        
                        // 执行父类的构造函数中的内容
                        superClass.apply(that, arguments);
                        __superClasses.push(superClass);
                    }
                }
            }
            
            if(typeof that.getAttr === 'function') {
                
                // 获取父类的私有属性集合
                attrs = cloneObj(attrs, that.getAttr() || {});
            }
            
            attrs = cloneObj(attrs, conf.attrs || {});
            
            // 方法:添加属性
            function setAttr(attrName, attrVal) {
                var that    = this,
                    attrObj = {};
                
                if(!attrs || typeof attrs !== 'object') {
                    attrs = {};
                }
                
                if(typeof attrName === 'object') {
                    
                    attrObj = attrName;
                } else if(typeof attrName === 'string') {
                    
                    attrObj[attrName] = attrVal;
                }
                
                if(attrObj) {
                    
                    for(var k in attrObj) {
                        
                        if(attrObj.hasOwnProperty(k)) {
                            
                            // 触发事件：setAttrBefore（设置attr之前触发）
                            if(typeof that.trigger === 'function') {
                                that.trigger('setAttrBefore', k, attrObj[k]);
                            }
                            
                            attrs[k] = attrObj[k];
                            
                            // 触发事件：setAttr（设置attr之后触发）
                            if(typeof that.trigger === 'function') {
                                that.trigger('setAttr', k, attrObj[k]);
                            }
                        }
                    }
                }
                
                return that;
            };
            
            // 方法:获取属性值
            function getAttr(attrName) {
                
                var that = this,
                    attrVal;
                
                if(arguments.length === 0) {
                    
                    // 如果没有设置任何参数，则将attrs对象（所有属性集合）返回
                    attrVal = cloneObj(attrs);
                } else {
                    
                    if(typeof attrName !== 'string') {
                        throw new Error('方法 getAttr() 的参数 attrName 必须为字符串类型');
                    }
                    
                    if(typeof attrs === 'object') {
                        attrVal = attrs[attrName];
                    }
                }
                
                return attrVal;
            };
            
            that.setAttr = setAttr;
            that.getAttr = getAttr;
            
            // 缓存超类列表
            that.setAttr('__superClasses', __superClasses);
            
            // 调用初始化方法
            if(typeof conf.init === 'function') {
                
                conf.init.apply(that, arguments);
            }
        };
        
        if(typeof superClasses === 'function') {
            
            superClasses = [superClasses];
        }
        
        if(superClasses && superClasses.constructor === Array) {
            
            // 遍历父类列表，实现多继承
            for(var i = 0, l = superClasses.length, superClass, subClass, subObj; i < l; i ++) {
                
                superClass = superClasses[i];
                
                if(typeof superClass !== 'function') {
                    continue;
                }
                
                subClass = function() {};
                subClass.prototype = superClass.prototype;
                subObj = new subClass();
                
                
                /*
                 * 将列表中第一个父类设置成直接父类（通过instanceOf运算符可以判
                 * 断出继承关系），而当前类之使用（继承）出第一个之外的其他类的属
                 * 性（属性和方法），因此使用instanceOf运算符判断当前类的实例和
                 * 第一个类的关系式会得到true的结果，而与其他类运算的结果则问false
                 * 如：obj为当前对象的实例，
                 * 则：
                 *    obj instanceof superClasses[0] 的结果为true
                 *    obj instanceof superClasses[1+] 的结果为false
                 * 不过可以使用该对象的instanceOf(superClass)方法来判断继承关系
                 * 如果参数superClass在superClasses存在，则该结果返回为true
                 */
                if(i === 0) {
                    
                    Constructor.prototype = subObj;
                } else {
                    
                    for(var k in subObj) {
                        Constructor.prototype[k] = subObj[k];
                    }
                }
            }
            
            if(typeof superClasses[0] === 'function') {
                Constructor.prototype._superClass = superClasses[0];
            }
        } else {
            
            Constructor.prototype._superClass = Object;
        }
        
        if(typeof Constructor.prototype.instanceOf === 'undefined') {
            
            Constructor.prototype.instanceOf = function(superClass) {
                
                var that = this;
                var result = that instanceof superClass;
                
                var superClasses = this.getAttr('__superClasses');
                
                if(!result && superClasses) {
                    
                    for(var i = 0, l = superClasses.length; i < l; i++) {
                        
                        if(superClass === superClasses[i]) {
                            return true;
                        }
                    }
                }
                
                return result;
            };
        }
        
        if(methods && typeof methods === 'object') {
            
            // 遍历：methods，将遍历得到的函数，追加至构造函数的原型对象中
            for(var key in methods) {
                
                if(typeof methods[key] === 'function' && methods.hasOwnProperty(key)) {
                    
                    Constructor.prototype[key] = methods[key];
                }
            }
        }
        
        // 返回构造函数
        return Constructor;
    }

    return createClass;
});