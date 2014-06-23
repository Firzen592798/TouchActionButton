// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.TouchActionButton = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	function detectmob() { 
	 if( navigator.userAgent.match(/Android/i)
	 || navigator.userAgent.match(/webOS/i)
	 || navigator.userAgent.match(/iPhone/i)
	 || navigator.userAgent.match(/iPad/i)
	 || navigator.userAgent.match(/iPod/i)
	 || navigator.userAgent.match(/BlackBerry/i)
	 || navigator.userAgent.match(/Windows Phone/i)
	 ){
		return true;
	  }
	 else {
		return false;
	  }
	}
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.TouchActionButton.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
		this.texture_img = new Image();
		this.texture_img["idtkLoadDisposed"] = true;
		this.texture_img.src = this.texture_file;
		this.texture_img.cr_filesize = this.texture_filesize;
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		//variables
		var self = this;
		this.downmouse = false;		
		this.texture_img = this.type.texture_img;
		
		this.pressedColor = this.properties[0];
		this.detectMobile = this.properties[1];
		// create action button
		this.elem = document.createElement("canvas");
		this.elem.setAttribute("id", "canvas");
		
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		
		if(detectmob() || this.detectMobile == 1){
			this.elem.width = this.width;
			this.elem.height = this.height;
			
			this.elem.addEventListener("mousedown", doMouseDown, false);
			document.addEventListener("mouseup", doMouseUp, false);
			
			this.elem.addEventListener("touchstart", doTouchStart, false);
			document.addEventListener("touchend", doTouchEnd, false);
			
			var ctx = this.elem.getContext('2d');
			document.getElementById(this.elem.id).style.opacity = (this.opacity);
			console.log(this.texture_img);
			ctx.drawImage(this.texture_img, 0, 0,  this.width, this.height);
		}
		
		function doMouseDown(event){
            //ctx.restore();
		    var rect = canvas.getBoundingClientRect();
			var mouseX = event.clientX - rect.left;
			var mouseY = event.clientY - rect.top;
			
			self.mouseDown();
			self.downmouse = true;
			
		}
		
		function doMouseUp(event){
			self.downmouse = false;
			self.mouseUp();
		}
		
		function doTouchStart(event){
			//if( navigator.userAgent.match(/Android/i) ) {   // if you already work on Android system, you can        skip this step
		    var rect = canvas.getBoundingClientRect();
			var touchX = event.changedTouches[0].pageX - rect.left;
			var touchY = event.changedTouches[0].pageY - rect.top;
			self.mouseDown();
			self.downmouse = true;
		}
	
		function doTouchEnd(event){
			self.downmouse = false;
			self.mouseUp();
			self.axisX = 0;
			self.axisY = 0;
			//self.runtime.trigger(cr.plugins_.TouchGamepad.prototype.cnds.onDirectionReleased, this);
		}
		this.updatePosition();
	};
	
	instanceProto.changeColorToPressed = function(){
		var ctx = this.elem.getContext('2d');
		ctx.globalCompositeOperation = "lighter";
		console.log(this.pressedColor);
		ctx.fillStyle = 'rgba(0, 204, 0, 0.5)';
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.save();
		ctx.drawImage(this.texture_img, 0, 0,  this.width, this.height);
		ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, 2 * Math.PI, false);
		ctx.fill();
	}
	
	instanceProto.changeColorToOriginal = function(){
		var ctx = this.elem.getContext('2d');
		ctx.globalCompositeOperation = "lighter";
		console.log(this.pressedColor);
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.save();
		ctx.drawImage(this.texture_img, 0, 0,  this.width, this.height);
	}
	
	instanceProto.mouseDown = function(){
		this.changeColorToPressed();
		this.runtime.trigger(cr.plugins_.TouchActionButton.prototype.cnds.OnButtonPressed, this);
	}
	
	instanceProto.mouseUp = function(){
		this.changeColorToOriginal();
		this.runtime.trigger(cr.plugins_.TouchActionButton.prototype.cnds.OnButtonReleased, this);
	}
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	instanceProto.updatePosition = function () 
	{
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		
		// Is entirely offscreen or invisible: hide
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			jQuery(this.elem).hide();
			return;
		}
		
		// Truncate to canvas size
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= this.runtime.width)
			right = this.runtime.width - 1;
		if (bottom >= this.runtime.height)
			bottom = this.runtime.height - 1;
			
		jQuery(this.elem).show();
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));
	};
	
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.MyCondition = function (myparam)
	{
		// return true if number is positive
		return myparam >= 0;
	};
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	var cnds = pluginProto.cnds;

	cnds.OnButtonPressed = function(dir)
	{
		return true;
	};
	
	cnds.OnButtonReleased = function(dir)
	{
		return true
	};
	
	cnds.OnButtonHold = function(dir)
	{
		return this.downmouse;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.MyAction = function (myparam)
	{
		// alert the message
		alert(myparam);
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	// the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());