#createClass


这是一个CMD模块，建议使用seajs加载调用该模块提供的功能。该模块抛出了一个函数：createClass(conf)，通过该函数可以创建一个javascript类（构造函数），该函数实现了类的（多）继承、私有变量的管理。通过该函数创建的类的实例，都会拥有三个相同的方法：setAttr()、setAttr()、instanceOf()，前两个方法是对实例的私有属性的管理，instanceOf()方法是判断继承关系。

---

## 使用方法

### 创建类/构造函数
```js
seajs.use('./dist/createClass.js', function(createClass) {
    
    // 创建一个Person类
    var Person = createClass({
        
        // 可以在此出配置私有属性，通过实例的getAttr('attr_name')方法获取
        attrs: {
            attr_name: 'xxxx'
            // ...
        },
        
        // 设置实例初始化函数
        init: function(name) {
            
            // this此时是Person类的一个实例，通过createClass创建类的实例都有setAttr、getAttr方法来设置/获取实例的私有属性
            this.setAttr('name', name); // 该方法也支持通过键/值的形式设置私有属性：this.setAttr({name: name});
        },
        
        // 配置类的方法
        methods: {
            showInfo: function() {
                
                // 输入姓名信息
                console.log('My name is ' + this.getAttr('name') + '.');
            }
            // 其他方法...
            // ,method_1: function() {}
        }
    });
    
    // 创建Person类的实例
    var p1 = new Person('Lucy');
    
    // 调用showInfo方法，显示名字信息
    p1.showInfo();  // 输出：My name is Lucy.
});
```


### 类继承
```js
seajs.use('./dist/createClass.js', function(createClass) {
    
    // 创建一个Person类
    var Person = createClass({
        
        // 设置实例初始化函数
        init: function(name) {
            
            this.setAttr('name', name);
        },
        
        // 配置类的方法
        methods: {
            showInfo: function() {
                
                // 输入姓名信息
                console.log('My name is ' + this.getAttr('name') + '.');
            }
        }
    });
    
    // 创建Student类，使其继承Person
    var Student = createClass({
    
        superClass: Person, // 如果继承多个类的话可以这样写：[Person, Class1...]
        
        init: function(name, sex) {
            
            this.setAttr('sex', sex);
        },
        
        methods: {
            showSex: function() {
                
                var sex = this.getAttr('sex');
                
                console.log(sex);
            }
        }
    });
    
    
    // 创建Person类的实例
    var p1 = new Person('Lucy');
    
    var s1 = new Student('John', 'boy');
    
    // 调用showInfo方法，显示名字信息
    p1.showInfo();  // 输出：My name is Lucy.
    
    // 调用s1的showInfo的方法
    s1.showInfo();  // 该方法来自父类：Person，输出：My name is John.
    
    s1.showSex();   // 输出：boy
    
    // 判断继承关系
    console.log(p1 instanceof Person);   // true
    console.log(s1 instanceof Student);  // true
    console.log(s1 instanceof Person);   // true
    console.log(s1 instanceof Object);   // true
    console.log(p1 instanceof Object);   // true
    console.log(p1 instanceof Student);  // false
    
    console.log(s1.instanceOf(Student));   // true
    console.log(s1.instanceOf(Person));    // true
    console.log(p1.instanceOf(Person));    // true
    console.log(p1.instanceOf(Student));   // false
    console.log(p1.instanceOf(Object));    // true
    console.log(s1.instanceOf(Object));    // true
});
```

---

## 实现原理

其实在大家的印象中JS实现面向对象的那一套东西很是蹩脚，首先，其继承模式使用原型链继承方式，和一般的类继承模式完全不一样；其次，JS没有私有属性的概念；还有，就是类（构造函数）和普通构造函数除了是否使用new去实例化，其他没多大区别，甚至经过改写不用new也可以去实例化；面向对象编程，其实说面向接口编程更合适，然而JS又没有接口的概念。等等，这些都是道出了JS面向对象编程的憋足。

基于以上缺点，很多人在JS开发中，根本不去使用面向对象的概念（封装、继承、多态、接口），需要对象，就直接以字面量的形式直接创建，然后在对象上添加所需的属性和方法即可，甚至可以搞一个函数做成工厂模式，生成相应的对象，一样能解决问题，不可否认，确实能达到目的，并且在JS开发中有的时候还必须使用上面的形式。

但是我这里想说的不是JS在面向对象方面和面向对象编程的缺点，而是通过JS的特点可以实现一般面向对象编程的方式，并且面向的好处也是显而易见的，特别在开发前端组件的时候，我认为面向对象的思想还是与其形态还是比较吻合的，这也是我编写这个createClass()模块的初衷和目的。下面是我在实现createClass过程中，对JS面向对象编程的一些实现方法和见解：

### JS的类
JS中类的，就是一个函数，即是构造函数，通过new运算符可以生成对应类型的对象，典型的类有：Object、Array、Function都是内置构造函数，甚至基本的数据类型也有对应的构造函数，如：String、Number、Boolean分别可以实例化出字符串、数值、布尔型的对象。我们可以自定义构造函数，通过new这个构造函数的时候，在构造函数内部有this这是当前实例化出来的对象，在构造函数内部可以通过this.xxx的形式随意添加、调用该实例的对象，如果不通过new的形式调用，this就不再指向构造函数的实例了。


### 封装
面对对象理论中的封装，其实说白了就是对对象的私有属性的管理，避免直接操作对象的属性，要通过seter、geter等方法去存取，以达到对其的保护作用。然而JS中又没有私有属性的说法（ES5之前应该是没有的），JS对象的属性都直接挂在对象上，通过 “.” 的形式公开访问，按照定义，这种形式的属性属于共有属性，可以对其进行任意操作，不会有任何保护措施，不管是对象内部，还是对象外部都可以不受限制的访问。那通过这样的属性实现封装的目的，看来是不太合适的。有些JS的开发者，为了达到保护属性的目的，采用了命名约定的形式，如：约定在属性名前有下划线的是私有属性——obj._prop1的形式，当然在我看来这是一个自欺欺人的做法，根本没有起到任何保护作用。

如果要保护变量不被公开访问（而是通过某些方法访问），在JS中，使用闭包再合适不过，闭包是通过函数实现，因此其中的变量在函数之外无法访问，如果函数抛出了一些函数，通过这些抛出的函数还可以访问闭包中的变量，这样就达到了变量的保护作用。createClass创建的类的实例化过程中，就是使用这样的原理来实现对象私有属性：在构造函数中定义了一个键值对变量（对象）attr = {}，同事定义了两个函数setAttr、getAttr来访问（添加/修改）这个键值对，并在实例化的时候将这两个方法挂到当前实例化的实例this.setAttr = setAttr、this.getAttr = getAttr，这样每个实例都会拥有一个闭包来保护它的私有属性，并且每个实例都拥有setAttr、getAttr两个方法来访问私有属性。

以上方式并且没有缺点，首先每个实例都会拥有setAttr、getAttr两个独立的方法，虽然他们的内容完全相同；另外，利用闭包实现私有属性，闭包的作用域不会释放。这是两个缺点是比较明显的，但是我认为相比其他模式使用这种方式是比较优化的方案了，就比较工厂模式而言：每个实例的所有属性和方法都是独立的，而当下的这种方式只有setAttr、getAttr两个方法是挂在实例上的，而其他的方法完全可以放到构造函数的prototype中。至于闭包，在做JS开发中就更无法避免使用了。因此，我认为为了实现封装的目的，付出这些代价是值得的。


### 继承
至于继承，在JS中也是老生常谈，大家都知道JS是原型继承模式，其原理不多赘述。继承了目的主要是为了复用代码，所谓站在前人肩膀上自己看的更远，复用别人的代码自己写的更少。在JS中实现类的继承，我总结了两个需要注意的点：其一、要完整的继承父类；其二，多继承，即如何实现继承多个父类。

完整继承父类的意思是什么呢？我们知道在实现支撑的操作的时候，都是将子类的原型对象替换成父类的一个实例，在将子类拥有的方法添加到新的原型对象上，但是我们知道，父类的实例的方法并非都定义到原型链上，有些方法我们可能会在构造函数中定义（直接挂在实例上，例如上述中的setAttr、getAttr方法），我认为，这些方法也需要继承给子类的，此时需要做的就是在子类的构造函数中执行父类的构造函数，执行过程中还要修改父类构造函数的上下文改成子类的实例，此时Function对象的apply方法就派上用场了，假使父类的构造函数叫SuperClass，在子类中我们就需要这么去调用父类构造函数了：SuperClass.apply(this, arguments)，此时的this是子类的实例，因此如果父类构造函数中定义了方法或者属性，此时也会将对应方法和属性定义到子类的实例中。

至于实现多继承，我的做法是合并对象，上面讲完整继承的时候说过：将子类的原型对象设置成父类的一个实例，如果有个多个父类，则将第一个除外的父类实例的属性都合并到第一个父类的实例中，子类的原型中就会拥有所有父类的方法和属性。不过这样做有一个缺点就是：使用instanceof来判断继承关系时，只有第一个父类的结果为true，如：类Class继承SuperClass1、SuperClass2、SuperClass3三个类，Class的实例为obj，则此时使用instanceof运算继承关系时，会得到如下结果：

```js
obj instanceof SuperClass1 // 结果为true
obj instanceof SuperClass2 // 结果为false
obj instanceof SuperClass3 // 结果为false
```

为什么会这样，我不再赘述，相信了解JS原型继承的人都能明白。为了尽量弥补这个问题，在使用createClass创建的类的原型链上都会有一个instanceOf(SuperClass)的方法，这个方法的实现很简单：先去使用instanceof运算符去判断继承关系，如果结果为false，在去实例的父类数组中比对，如果SuperClass出现在父类数组中则说明实例和SuperClass存在继承关系。


### 多态
在java语言中的多态的形式就是，对象的某个方法可以有不同的使用方式——可以有不同返回值、可以有不同的参数等，不过这个问题在JS中根本就不是问题，JS中function的参数本来就是非常灵活的，调用function的时候你可以任意设置参数，只要function中对其作出对应的处理，完全可以实现java的效果，也可以说JS的function就是多态的，对象的方法就是一个function，其多台的特性不言自明。


### 接口
JS没有接口的概念，但是根据接口概念，在JS中也完全可以模仿出接口的形态。在Java中我们知道接口就是定义一个标准，如果要支持这个接口，就要实现其定义的标准，说白了接口就是一个标准的描述，没有实质性的实现，如果将接口和类对比的话，接口就是一堆空方法，而类实现接口后，将这一堆空方法给填充成有内容的东西。所以，简单的说，接口就是一个类，只不过其定义的方法都是空的，接口的目的就是一个标准，而不是实现。

至于接口的作用，我想用下面的需求去说明：在前端页面开发中，我们经常需要封装一些UI组件，如：对话框、日历，这些组件呢有很大的共性：他们需要控呈现UI界面、通过操作UI界面来完成我们要求、如果组件的任务已经完成了，需要把组件的操作UI给释放掉，以达到性能优化；基本上每个UI组件都会拥有上述的行为，所以此时可以定义一个UI组件接口，将这一类的组件标准化，如下：

```js
// 定义UI组件接口Widget，方法都是空的
var Widget = createClass({
    methods: {
        // 程序UI接口的过程，我们成为渲染，因此定义render方法，完成渲染操作
        render: function() {},
        
        // 既然是UI组件，应该拥有显示/关闭界面的功能，因此定义：show、hide方法
        show: function() {},
        hide: function() {},
        
        // 在UI的DOM上绑定一些事件
        bindUI: function() {}
        
        
        // 组件任务完成，我们需要将其释放销毁，定义destroy方法
        destroy: function() {}
    }
});
```

如此，一个接口已经定义好了，他的作用就是标准化UI组件（另外，面向接口编程也会降低耦合性，这里涉及设计模式的知识，不在此赘述）。标准已经建立，下面我们就要实现这样一个标准，我们创建一个UI组件：Dialog（对话框）组件，其需要实现Widget的标准：

```js
// 定义UI组件接口Widget，方法都是空的
var Dialog = createClass({
    
    // 实现接口：继承接口
    superClass: Widget,
    
    methods: {
        
        // 填充接口定义的方法，并创建当前组件自定义的方法
    
        // 程序UI接口的过程，我们成为渲染，因此定义render方法，完成渲染操作
        render: function() {
            
            // 渲染过程就是创建UI界面的过程，在前端就是创建DOM
            
            var dialogDom = document.createElement('div');
            var innerHtml = [
                '<h4 class="dialog-title">对话框标题栏</h4>',
                '<div class="dialog-bd"><!--对话框内容--></div>'
                '<a class="dialog-close" href="#" title="点击关闭对话框">x</a>'
            ].join('');
            
            dialogDom.innerHTML = innerHtml;
            
            dialogDom.stlye.display = 'none';
            
            // 加入文档流，渲染完毕
            document.body.appendChild(dialogDom);
            
            // 将dom设为私有属性，以便其他方法使用
            this.setAttr('dialogDom', dialogDom);
            
            // 在UI上绑定事件
            this.bindUI();
        },
        
        bindUI: function() {
            
            var dialog = this;
            var dialogDom = this.getAttr('dialogDom');
            
            dialogDom.addEventListener('click', function(event) {
                
                // 单击关闭按钮的时候关闭对话框
                if(event.srcEement.className === 'dialog-close') {
                    
                    dialog.hide();
                }
            });
        }
        
        // 既然是UI组件，应该拥有显示/关闭界面的功能，因此定义：show、hide方法
        show: function() {
            
            var dialogDom = this.getAttr('dialogDom');
            
            dialogDom.style.display = 'block';
        },
        
        hide: function() {
        
            var dialogDom = this.getAttr('dialogDom');
            
            dialogDom.style.display = 'none';
        },
        
        // 组件任务完成，我们需要将其释放销毁，定义destroy方法
        destroy: function() {
            
            // 销毁组件
            
            var dialogDom = this.getAttr('dialogDom');
            
            // 删除组件DOM上的绑定的事件
            dialogDom.removeEventListener('click');
            
            // 将DOM从文档流中删除
            dialogDom.remove();
            dialogDom = null;
            
            this.setAttr('dialogDom', null);
        },
        
        // 也可以定义标准以外的一些方法，比如，我们需要按需求改变对话框的位置，可定定义position方法定位弹窗位置
        position: function(left, top) {
            
            var dialogDom = this.getAttr('dialogDom');
            
            dialogDom.style.left = left + 'px';
            dialogDom.style.top = top + 'px';
        },
        // 其他方法内容省略...
        setTitle: function(title) {
            // 设置标题栏内容...
        },
        setContent: function(content) {
            // 设置对话框显示的内容
        }
    }
});
```

至此Dialog组件定义完毕，创建组件的基本流程已经体现出来，至于其逻辑包括组件的UI样式，不在此完全的展现。根据Widget的标准，要使用组件是需要创建组件类的实例，然后调用实例的render()方法将其渲染后，可以对其操作，当组件实例对象已经完成一任务时，则将其释放销毁。

```js
// 使用Dialog组件

var dialog = new Dialog();

// 渲染组件
dialog.render();

// 设置标题栏
dialog.setTitle('提示对话框');

// 设置对话框的的内容
dialog.setContent('这是一个对话框');

// 显示对话框
dialog.show();

// 控制对话框的位置
dialog.position(300, 300);

// 3秒后关闭对话框
setTimeout(function() {

    dialog.hide();
    
    // 如果不再使用这个对话框了，可以将其销毁
    dialog.destroy();
    dialog = null;
}, 3000);
```


## 总结
以上的描述是我对JS面对对象实现的一些解决方案，也是我对面向对象编程的理解，希望将这些东西总结、分享出来，对别人有帮助，更希望有高手指出其中的问题，学习进步。以上的理论，在createClass模块中都已经实现，并且自己也使用createClass创建了一些相对复杂的组件，之后我会逐渐将这些组件开源分享出来。
