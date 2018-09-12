selectedSlide = null;

History = {
	list: [],
	position: -1,
	setList: function(){
		History.list.push({id: selectedSlide.id, state: styleToNumber()});
		History.position++;
		History.list.length = History.position;
	},
	setPosition: function(position){
		const state = History.list[position];
		History.position = position;
		document.querySelector(`#${state.id}`).ondblclick();

		const element = selectedSlide.slideElement,
			values = state.state;
		Object.keys(values).forEach(key => {
			element.setAttribute(`data-${key}`, values[key]);
		})
		console.log(History.list, History.position)
	},
	undo: function(){
		if(History.position > 0){
			History.setPosition(History.position - 1);
		}
	},
	redo: function(){
		if(History.position < History.list.length - 1){
			History.setPosition(History.position + 1);
		}
	}
}

Controllers = {
	_active: 'move',
	get active(){
		return Controllers._active;
	},
	set active(value){
		if(['move', 'rotate', 'scale'].indexOf(value) !== -1){
			Controllers._active = value;
			document.querySelectorAll('.controller-type, .input-controllers-container').forEach(element => element.classList.remove('is-active'));
			document.querySelector(`.controller-type.${value}`).classList.add('is-active');
			document.querySelector(`.input-controllers-container.${value}`).classList.add('is-active');
		}
	},
	timer: null,
	stopTimer: function(relative = false){
		clearInterval(Controllers.timer);
		document.querySelector('iframe').contentWindow.document.querySelector('main > div').style.transitionDuration = '0s';
		styleToData();
		if(relative){
			styleToInput();
		}
		if(selectedSlide.id === 'overview'){
			document.querySelector('iframe').contentWindow.impress().goto(selectedSlide.id)
		}
	},
	move: {
		x: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.move.x(element, relative)}, 50);
			if(relative){
				ElementAttr.translate3dXRelative = parseFloat(element.value);
			}else{
				ElementAttr.translate3dX = parseFloat(element.value);
			}
		},
		y: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.move.y(element, relative)}, 50);
			if(relative){
				ElementAttr.translate3dYRelative = parseFloat(element.value);
			}else{
				ElementAttr.translate3dY = parseFloat(element.value);
			}
		},
		z: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.move.z(element, relative)}, 50);
			if(relative){
				ElementAttr.translate3dZRelative = parseFloat(element.value);
			}else{
				ElementAttr.translate3dZ = parseFloat(element.value);
			}
		}
	},
	rotate: {
		x: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.rotate.x(element, relative)}, 50);
			if(relative){
				ElementAttr.rotateXRelative = parseFloat(element.value);
			}else{
				ElementAttr.rotateX = parseFloat(element.value);
			}
		},
		y: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.rotate.y(element, relative)}, 50);
			if(relative){
				ElementAttr.rotateYRelative = parseFloat(element.value);
			}else{
				ElementAttr.rotateY = parseFloat(element.value);
			}
		},
		z: function(element, relative = false){
			Controllers.stopTimer(relative);
			Controllers.timer = setInterval(()=>{Controllers.rotate.z(element, relative)}, 50);
			if(relative){
				ElementAttr.rotateZRelative = parseFloat(element.value);
			}else{
				ElementAttr.rotateZ = parseFloat(element.value);
			}
		}
	},
	scale: function(element, relative = false){
		Controllers.stopTimer(relative);
		Controllers.timer = setInterval(()=>{Controllers.scale(element, relative)}, 50);
		if(relative){
				ElementAttr.scaleRelative = parseFloat(element.value);
		}else{
			ElementAttr.scale = parseFloat(element.value);
		}
	}
}

ElementAttr = {
	slideElement: null,
	style: null,
	regex: {
		get translate3d(){ return (/translate3d\((-?\d+\.?\d*)px, (-?\d+\.?\d*)px, (-?\d+\.?\d*)px\)/gi) },
		get rotateX(){ return (/rotateX\((-?\d+\.?\d*)deg\)/gi) },
		get rotateY(){ return (/rotateY\((-?\d+\.?\d*)deg\)/gi) },
		get rotateZ(){ return (/rotateZ\((-?\d+\.?\d*)deg\)/gi) },
		get scale(){ return (/scale\((-?\d+\.?\d*)\)/gi) }
	},
	get translate3d(){
		let [translate3d, tx, ty, tz] = ElementAttr.regex.translate3d.exec(ElementAttr.style.transform);
		return {
			'x': parseFloat(tx),
			'y': parseFloat(ty),
			'z': parseFloat(tz)
		}
	},
	set translate3dX(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d(${n}px, $2px, $3px)`)
	},
	set translate3dY(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d($1px, ${n}px, $3px)`)
	},
	set translate3dZ(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d($1px, $2px, ${n}px)`)
	},
	set translate3dXRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d(${ElementAttr.translate3d.x + n*100}px, $2px, $3px)`)
	},
	set translate3dYRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d($1px, ${ElementAttr.translate3d.y + n*-100}px, $3px)`)
	},
	set translate3dZRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.translate3d, `translate3d($1px, $2px, ${ElementAttr.translate3d.z + n*-100}px)`)
	},
	get rotateX(){
		const [rotateX, rx] = ElementAttr.regex.rotateX.exec(ElementAttr.style.transform);
		return parseFloat(rx);
	},
	set rotateX(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateX, `rotateX(${n}deg)`);
	},
	set rotateXRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateX, `rotateX(${ElementAttr.rotateX + n*5}deg)`);
	},
	get rotateY(){
		const [rotateY, ry] = ElementAttr.regex.rotateY.exec(ElementAttr.style.transform);
		return parseFloat(ry);		
	},
	set rotateY(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateY, `rotateY(${n}deg)`);
	},
	set rotateYRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateY, `rotateY(${ElementAttr.rotateY + n*5}deg)`);
	},
	get rotateZ(){
		const [rotateZ, rz] = ElementAttr.regex.rotateZ.exec(ElementAttr.style.transform);
		return parseFloat(rz);		
	},
	set rotateZ(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateZ, `rotateZ(${n}deg)`);
	},
	set rotateZRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.rotateZ, `rotateZ(${ElementAttr.rotateZ + n*5}deg)`);
	},
	get scale(){
		const [scale, sc] = ElementAttr.regex.scale.exec(ElementAttr.style.transform);
		return parseFloat(sc);		
	},
	set scale(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.scale, `scale(${n})`);
	},
	set scaleRelative(n){
		ElementAttr.style.transform = ElementAttr.style.transform.replace(ElementAttr.regex.scale, `scale(${ElementAttr.scale + n/10})`);
	}
}



function setList(){
    let html = '<ul class="slides-list" >';
    html += `
       	<li id="camera" class="slides-list-item" 
       		onclick="selectListItem(this)" 
       		ondblclick="selectSlide(this)" >
       		Camera
       	</li>`
   	document.querySelector('iframe').contentWindow.document.querySelector('main > div').id = 'camera';
   	document.querySelector('iframe').contentWindow.document.querySelector('#overview').style.border = '5px solid red';
   	document.querySelector('iframe').contentWindow.document.querySelector('#overview').style.display = 'initial';
    document.querySelector('iframe').contentWindow.document.querySelectorAll('main > div > *').forEach(element => {
       html += `
       	<li id="${element.id}" class="slides-list-item" 
       		onclick="selectListItem(this)" 
       		ondblclick="selectSlide(this)" >
       		#${element.id}
       	</li>`
    })
    html += '</ul>';
    document.querySelector('#list-container').innerHTML = html;
    document.querySelectorAll('.slides-list-item')[1].click();
}

function selectListItem(element){
	selectedSlide = {
		id: element.id,
		listElement: element,
		slideElement: document.querySelector('iframe').contentWindow.document.querySelector(`#${element.id}`)
	}	
	ElementAttr.slideElement = selectedSlide.slideElement;
	ElementAttr.style = selectedSlide.slideElement.style;
	document.querySelectorAll('.slides-list-item').forEach(element => {
		element.classList.remove('selected')
	});
	document.querySelector(`#${element.id}`).classList.add('selected');
	styleToData();
	styleToInput();
}

function selectSlide(element){
	document.querySelector('iframe').contentWindow.impress().goto(`${element.id}`)
}


function styleToNumber(){
	const {x, y, z} = ElementAttr.translate3d;
	return {
		x,
		y,
		z,
		'rotate-x': ElementAttr.rotateX,
		'rotate-y': ElementAttr.rotateY,
		'rotate-z': ElementAttr.rotateZ,
		'scale': ElementAttr.scale
	}
}

let styleToDataTimer = null;
function styleToData(){
	clearTimeout(styleToDataTimer);
	styleToDataTimer = setTimeout(function(){
		const element = selectedSlide.slideElement,
			values = styleToNumber();
		Object.keys(values).forEach(key => {
			element.setAttribute(`data-${key}`, values[key]);
		})
		History.setList();
	}, 300);
}

function styleToInput(){
	const values = styleToNumber();
	document.querySelector('#x-text-controller').value = values['x'];
	document.querySelector('#y-text-controller').value = values['y'];
	document.querySelector('#z-text-controller').value = values['z'];
	document.querySelector('#rx-text-controller').value = values['rotate-x'];
	document.querySelector('#ry-text-controller').value = values['rotate-y'];
	document.querySelector('#rz-text-controller').value = values['rotate-z'];
	document.querySelector('#scale-text-controller').value = values['scale'];

}

function inputToStyle(){
	const x = document.querySelector('#x-text-controller').value = values['x'],
		y = document.querySelector('#y-text-controller').value = values['y'],
		z = document.querySelector('#z-text-controller').value = values['z'],
		rx = document.querySelector('#rx-text-controller').value = values['rotate-x'],
		ry = document.querySelector('#ry-text-controller').value = values['rotate-y'],
		rz = document.querySelector('#rz-text-controller').value = values['rotate-z'],
		scale = document.querySelector('#scale-text-controller').value = values['scale'];
	ElementAttr.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
}

function copySlidesHTML(){
	const html = document.querySelector('iframe').contentDocument.querySelector('#camera').innerHTML.trim().replace('border: 5px solid red;', '');
	copyStringToClipboard(html);
}

function copyStringToClipboard (string) {
    function handler (event){
        event.clipboardData.setData('text/plain', string);
        event.preventDefault();
        document.removeEventListener('copy', handler, true);
    }

    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
}

document.addEventListener('keyup', function(event){
	switch(event.key){
		case 'q': document.querySelector('.slides-list-item.selected').ondblclick(); break;
		case 'w': Controllers.active = 'move'; break;
		case 'e': Controllers.active = 'rotate'; break;
		case 'r': Controllers.active = 'scale'; break;
	}
})


