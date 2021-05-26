
function myObject() {};

myObject.create = function(prototypeList) {
	var o = {};
	o.__proto__ = myObject.prototype;
	/*
	 * To keep the prototypeList hidden I keep it as a local variable, and to
	 * keep people form modifying it I return a copy of it. You could also not
	 * protect the list at all and give others the possibility to modify it by
	 * returning an original, it is already hidden and people who try to modify
	 * it should be aware that if they do, they might break something. The
	 * reason I made the decision to copy the list in the end is mostly so that
	 * I don't break anything while working on the assignment :)
	 */
	/*
	 * Another downside of keeping the propertyList local and copying it is that
	 * all functions working on the list has to be stored in the object itself
	 * to get modifiable access. At first I had the cyclic check in a set-method
	 * and placed the addPrototype-method in the myObject.prototype, where I set
	 * the PrototypeList to a copy of the list with the new value added. But
	 * this felt very ineffective, not only was I copying the list every time I
	 * added a value, I was also checking the whole list for cyclic dependencies
	 * every time. I might be wrong, but I felt like the better solution was to
	 * store the methods in the object instead and have the cyclic check in
	 * addPrototype instead of set (and removing the set-method all together).
	 * There may also be another, even better solution that I'm not seeing right
	 * now :)
	 */
	/*
	 * A removePrototype-function was on my todo-list but I didn't have the
	 * time, it wouldn't cause any problem with cyclic dependencies and I don't
	 * think it is inside the scope for the assignment
	 */
	var prototypes = prototypeList;
	Object.defineProperty(o, "_prototypes", {
    	get : function() {
    		var copy = prototypes;
    		if (copy) {
    			copy = prototypes.slice();
    		}
    		return copy;
    	}
    });
	
	// this function is provided for modification of the prototypeList after the
	// creation of an object
	o.addPrototype = function(obj) {
		// I don't know why you would want to inherit directly from the same
		// prototype twice, is not really an error, so i ignore the request
		if(prototypes && prototypes.includes(obj)) {
			return;
		}
		
		if(this === obj || makesCircular(obj._prototypes)) {
			console.log(new Error("This action causes a circular dependency"));
			return;
		}
		// if prototypes is null (or undefined) we have to create an empty array
		// first
		if (!prototypes) {
			prototypes = [];
		}
		
		prototypes.push(obj);
		
		
		// Helper-function to recursively check through ancestors
		// could have been placed in myObject.prototype to not have it in every
		// object, but I didn't know if it was okey to add extra public methods,
		// not specified in the assignment-instructions
		function makesCircular(protos) {
			if(protos) {
				var result;
			
	       		for (var p of protos) {
        			if (p === o) {
        				result = true;
        			} else {
        				result = makesCircular(p._prototypes);
        			}
        			if (result) {
        				return result;
        			}
        		}
			}
		}
	}
	
	return o;
}


/*
 * The assignment didn't specify what should happen if create is called on an
 * object instead of myObject (only that it should be possible to call it) for
 * this reason I simply forward the call to myObject.create()
 */
myObject.prototype.create = function(prototypeList) {
	return myObject.create(prototypeList);
}

myObject.prototype.call = function(funcName, parameters) {
	/*
	 * I wanted to use the simple recursiveness of the call-function, but I'm
	 * aware this solution might have it's problems Mainly, we lose the
	 * connection to 'this' of the first caller, this would be a problem if
	 * attribute-lookup was something we had to handle in the assignment, this
	 * could be fixed by using the same type of look-up used in the Class-based
	 * version instead, or by having another function in every object which also
	 * takes the first 'this' as an argument (also I'm not too familiar with
	 * Errors in JavaScript, so checking the message of the error might be a
	 * little bit clumsy and could probably be handled better)
	 */
	
	if (this[funcName]) {
		return this[funcName](...parameters);
	}
	if (this._prototypes) {
		for (p of this._prototypes) {
			var result = p.call(funcName, parameters);
			
			// If the result was an error(function not found in p or its
			// ancestors) we should not return but simply continue the loop
			// with the next p
			if ( !( (result instanceof Error) && result.message.startsWith("Could not find function" ) ) ) {
				return result;
			}
		}		
	}
	return new Error("Could not find function \"" + funcName + "\" for this object");
}



