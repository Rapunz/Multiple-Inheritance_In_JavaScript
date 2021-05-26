

createClass = function (className, superClassList) {
    var cl = {};
    cl.className = className;
    cl.__proto__ = createClass.prototype;
  // for the circular inheritance detection see discussion in part one,
	// classlist handled like prototypelist
    var mySuperClassList = superClassList;
    Object.defineProperty(cl, "_superClassList", {
    	get : function() {
    		var copy = mySuperClassList;
    		if (copy) {
    			copy = mySuperClassList.slice();
    		}
    		return copy;
    	}
    });
    
    cl.addSuperClass = function(superClass) {
		
		if(mySuperClassList && mySuperClassList.includes(superClass)) {
			return;
		}
		
		if(this === superClass || makesCircular(superClass._superClassList)) {
			console.log(new Error("This action causes a circular dependency"));
			return;
		}
		
		if (!mySuperClassList) {
			mySuperClassList = [];
		}
		mySuperClassList.push(superClass);
		
		function makesCircular(supers) {
			if(supers) {
				var result;
			
	       		for (var c of supers) {
        			if (c === cl) {
        				result = true;
        			} else {
        				result = makesCircular(c._superClassList);
        			}
        			if (result) {
        				return result;
        			}
        		}
			}
		}
	}
    return cl;
}


createClass.prototype.new = function() {
	var obj = {};
	obj.myClass = this;
	obj.__proto__= this.new.prototype;
	return obj;
}

createClass.prototype.addSuperClass = function(newClass) {	
	if(newClass) {
		var temp = [];
		if (this._superClassList) {
			temp = this._superClassList.slice();
		}
		temp.push(newClass);
		this._superClassList = temp;
	}
}


createClass.prototype.new.prototype.call = function(funcName, parameters) {
	
	var func = this[funcName];
	
	if(!func) {
		func = this.myClass[funcName];
		
		if(!func && this.myClass._superClassList) {
			func = getMethodFromSuperList(this.myClass._superClassList);
		}
		
		if(!func) {
			return new Error("Could not find function \"" + funcName + "\" for this object");
		}
	}
		
	return func.apply(this, parameters);

	function getMethodFromSuperList(superClassList) {
		var result;
		for (var p of superClassList) {
			
			result = p[funcName];
			
			if(!result && p._superClassList) {
				result = getMethodFromSuperList(p._superClassList);
			}
			// If we have found our function we are done, if not we should
			// continue the loop
			if (result) {
				return result;
			}
		}
	}
}

