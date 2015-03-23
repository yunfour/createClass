define(function(require) {
    
    var createClass = require('../dist/createClass');
    var expect = chai.expect;
    

    describe("Class API", function() {
        
        describe("Private property", function() {
            
            var NewClass = createClass();
        
            var obj = new NewClass();
            
            it("setAttr method", function() {
                
                expect(typeof obj.setAttr === 'function').to.be.true;
            });
            it("getAttr method", function() {
                
                expect(typeof obj.getAttr === 'function').to.be.true;
            });
            it('Set and get private property value', function() {
                
                var val = 'test';
                
                obj.setAttr('test', val);
                
                expect(obj.getAttr('test') === val).to.be.true;
            });
        });
        
        describe("Instance of", function() {
            
            var Person = createClass({
                init: function(name) {
                    
                    this.setAttr('name', name);
                },
                
                methods: {
                    
                    showName: function() {
                        
                        console.log('My name is ' + this.getAttr('name') + '.');
                    }
                }
            });
            
            var Student = createClass({
                
                superClass: [Person],
                
                init: function(name, sex) {
                    
                    this.setAttr('sex', sex);
                },
                
                methods: {
                    
                    showSex: function() {
                        
                        console.log('I am a ' + this.getAttr('sex') + '.');
                    }
                }
            });
            
            var person = new Person('John'),
                student = new Student('Jack', 'boy');
            
            
            it("showName form Person class", function() {
                
                expect(person.showName === Person.prototype.showName).to.be.true;
                expect(student.showName === Person.prototype.showName).to.be.true;
            });
            
            it('instanceof', function() {
                
                expect(person instanceof Person).to.be.true;
                expect(student instanceof Person).to.be.true;
                expect(student instanceof Person).to.be.true;
                expect(person instanceof Student).to.be.false;  // 没有继承关系
                expect(person instanceof Object).to.be.true;
                expect(student instanceof Object).to.be.true;
            });
            
            it('instanceOf() method', function() {
                
                expect(person.instanceOf(Person)).to.be.true;
                expect(student.instanceOf(Person)).to.be.true;
                expect(student.instanceOf(Person)).to.be.true;
                expect(person.instanceOf(Student)).to.be.false;  // 没有继承关系
                expect(person.instanceOf(Object)).to.be.true;
                expect(student.instanceOf(Object)).to.be.true;
            });
        });
    });
});