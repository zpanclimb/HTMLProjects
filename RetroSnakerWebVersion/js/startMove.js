
//使用json , 多物体同时运动，多属性同时运动 , 链式运动

//getByClassName  通过类名获取元素节点
function getByClassName(oParentNode, classNameStr)
{
	var aElement = oParentNode.getElementsByTagName('*');
	var aResult = [];
	
	for(var i=0;i<aElement.length;i++)
	{
		if(aElement[i].className == classNameStr)
		{
			aResult.push(aElement[i]);
		}
	}
	return aResult;
}

//getCurrentStyle 获取当前的，计算完的样式
function getCurrentStyle(obj, property)
{
	if(obj.currentStyle) {
		return obj.currentStyle[property];
	} else {
		return getComputedStyle(obj,false)[property];
	}
}

/**
 * 运动框架，startMove(操作对象,json,结束时调用函数,变化速率)
 * @description startMove - method used to change attributes of target
 * @param {Object} obj - object of operation
 * @param {JSON} json - JSON object of attribute set
 * @param {function} fnEnd - function called at the end
 * @param {number} rate - change rate of attributes
 * @example startMove(obj, {"attr1":value1,"attr2":value2,...}, function(){}, 6);
 */
function startMove(obj, json, fnEnd, rate)
{
	clearInterval(obj.timer);
	var stopOr = true;		//是否停止定时器
	var currentStyle = 0;	//当前的样式
	var speed = 0;				//样式变化的速度
	var moveRate = 6;     //变化速率，值为 1 时直接完成属性变化，值大于 1 时是一个减速变化的过程
    
  if(rate && rate>=1)
  {
    moveRate = rate;
  }
  
	obj.timer = setInterval(function(){
		stopOr = true;// *
		
		for(var attr in json)
		{
			//将对象的样式分为透明度和其他样式
			if(attr == 'opacity') {
				currentStyle = Math.round(parseFloat(getCurrentStyle(obj, 'opacity'))*100);//透明度去掉末尾的小数
			} else {
				currentStyle = parseInt(getCurrentStyle(obj, attr)); //getCurrentStyle()返回的是如100px这样带有单位的值,使用parseInt()取其中的数字
			}
			//计算运动的速度,大于零向上取整，小于零向下取整
			speed = (json[attr] - currentStyle) / moveRate; 
			speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);
			//改变对象的样式
			if(attr == 'opacity') {
				obj.style.filter = 'alpha(opacity:'+(currentStyle+speed)+')';
				obj.style.opacity = (currentStyle+speed)/100;
			} else {
				obj.style[attr] = currentStyle + speed + 'px';
			}
			//保证json里面的每一个属性都变化到最终的值
			if(currentStyle != json[attr]) {
				stopOr = false;
			}
		}
		//当所有的属性都变化完成
		if(stopOr) 
		{
			clearInterval(obj.timer);
			if(fnEnd) {
				fnEnd();
			}
		} 
	}, 30);
}