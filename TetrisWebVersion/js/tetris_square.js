/*
      ————           ————          ————   |               |        |
     | + |    ————      |          |      |               |        |
     ————               ————    ————      ——————     ——————     ——————
数字： 0        1        2        3         4            5         6
颜色：gold  darkcyan  crimson  darkgreen  darkorange  darkblue  darkmagenta   
*/
/**
 * 方块大小：30px
 * 移动区域：20行  10列
 */

var fallingSpeed = 500	//方块下落速度
var heapHighest = 0; 	//方块堆积在底部的高度
var clearRowsNum = 0; //清除行的数目
var score = 0;        //分数
var playGame = true;		//是否重新开始游戏
var gameContinue = true;	//游戏是否暂停
var nowNum = Math.round(Math.random()*6);	//当前随机出现的方块
var nextNum = Math.round(Math.random()*6);  //下一个随机出现的方块
var accArray = new Array(20); //已经堆积下来的方块
var totalArray = [];          //游戏结束时清空moveArea区域

var timer = null; //定时器
var previewContent = document.getElementById('previewContent'); //预览区域
var moveArea = document.getElementById('moveArea');				//游戏区域
var currentScore = document.getElementById('currentScore');		//实时分数
var clearLine = document.getElementById('clearLine');			//清楚行数目
var scorePopup = document.getElementById('scorePopup');			//最终得分弹出框
var finalScore = document.getElementById('finalScore');;    //得分弹出框显示分数

var preview = null; //预览
var nowModle = null;//正在下落的方块

//弹出提示框，得分
function showPopup(oEle)
{
  var okayBtn = oEle.getElementsByTagName('input')[0];
  var oDiv = oEle.getElementsByTagName('div')[0];
  
  oEle.style.display = 'block';
  startMove(oEle,{"opacity":100,"height":250});
  startMove(oDiv,{"opacity":100,"height":50});
  
  okayBtn.onclick = function()
  {
    startMove(oEle,{"opacity":0,"height":0});
    startMove(oDiv,{"opacity":0,"height":0},function()
    {
      oEle.style.display = 'none';
    });
  };
}

//创造一个元素节点span，作为方块组成节点的载体
function createSquareNode(parentNode)
{
  var oSpan = document.createElement('span');
  oSpan.className = 'squareElement';
  parentNode.appendChild(oSpan);
  return oSpan;
}

//json：颜色
var modleColor = {
	"0":"gold",
	"1":"darkcyan",
	"2":"crimson",
	"3":"darkgreen",
	"4":"darkorange",
	"5":"darkblue",
	"6":"darkmagenta"
};
//初始化存放堆积方块的数组
(function initArray()
{
  for(var i=0;i<accArray.length;i++)
  {
    accArray[i] = new Array(10);
    for(var j=0;j<10;j++){
      accArray[i][j] = 0;
    }
    accArray[i].size = 0;
  }
}())
//清除存放堆积方块的数组的内容
function clearArray()
{
  for(var i=0;i<accArray.length;i++)
  {
    for(var j=0;j<10;j++)
    {
      if(accArray[i][j]!=0 && accArray[i][j].node.parentNode != null)
      {
        moveArea.removeChild(accArray[i][j].node);
      }
      accArray[i][j] = 0;
    }
    accArray[i].size = 0;
  }
  for(var i=0;i<totalArray.length;i++)
  {
    if(totalArray[i].node.parentNode != null) { //在moveArea里面
      moveArea.removeChild(totalArray[i].node);
    } else {
      totalArray[i] = 0;
    }
  }
}
//将到达位置的方块放入数组
function accumulate(obj)
{
  accArray[obj.first.y][obj.first.x] = obj.first;
  accArray[obj.first.y].size ++;
  accArray[obj.second.y][obj.second.x] = obj.second;
  accArray[obj.second.y].size ++;
  accArray[obj.third.y][obj.third.x] = obj.third;
  accArray[obj.third.y].size ++;
  accArray[obj.fourth.y][obj.fourth.x] = obj.fourth;
  accArray[obj.fourth.y].size ++;
  //检查数组的一行有没有填满，填满了就将这一行清除，上面的全部下移一行
  for(var i=0;i<accArray.length;i++)
  {
    if(accArray[i].size == 10)//如果这一行已经满了
    {
      accArray[i].size = 0;
      clearRowsNum++; //消除行数目加 1 
      score += 10;    //每消除一行，分数加 10 
      clearLine.innerHTML = clearRowsNum;//消除行数目更新
      currentScore.innerHTML = score;//分数更新
      //分数加大，下落速度加大
      if(score >= 300) {
        fallingSpeed = 400;
        if(score >= 600) {
          fallingSpeed = 300;
          if(score >= 900) {
            fallingSpeed = 200;
            if(score >= 1200) {
              fallingSpeed = 150;
              if(score >= 1500) {
                fallingSpeed = 100;
              }
            }
          }
        }
      }
      for(var j=0;j<10;j++)//移除满的那一行
      {
        //产生了闭包，还没有解决
        //startMove(accArray[i][j].node,{"height":0,"opacity":0},function(){
          moveArea.removeChild(accArray[i][j].node);
        //});
        accArray[i][j] = 0;
      }
      //上面的全部下移一行
      for(var k=i-1;k>0;k--) //从 i-1 倒数至 0 行
      {
        if(accArray[k].size == 0) {
          continue;
        }
        for(var l=0;l<10;l++)
        {
          if(accArray[k][l] != 0)//accArray[k][l] 放的是 方块
          {
            accArray[k+1][l] = accArray[k][l]; //方块下移一格
            accArray[k+1][l].y++;
            accArray[k+1][l].drawSquare();
            accArray[k][l] = 0;
          }
        }
        accArray[k+1].size = accArray[k].size;
        accArray[k].size = 0;
      }
    }
  }
}

//模块整体着色
function setColor(obj)
{
	var color = '';
	switch (obj.bgColor)
	{
		case 0: color = modleColor['0']; break;
		case 1: color = modleColor['1']; break;
		case 2: color = modleColor['2']; break;
		case 3: color = modleColor['3']; break;
		case 4: color = modleColor['4']; break;
		case 5: color = modleColor['5']; break;
		case 6: color = modleColor['6']; break;
	}
	obj.first.node.style.backgroundColor = color;
	obj.second.node.style.backgroundColor = color;
	obj.third.node.style.backgroundColor = color;
	obj.fourth.node.style.backgroundColor = color;
}

//方块左右移动
function move(obj, leftOrRight)
{
  /* 还需要判断一下最底下一个方块下方是否有方块*/
  var flag = 0;
  if(leftOrRight == 'left') {
    flag = -1;
  } else {
    flag = 1;
  }  
  //检测左右移动方向上有没有方块
  if(accArray[obj.first.y][obj.first.x+flag] != 0) {
    return;
  } else if(accArray[obj.second.y][obj.second.x+flag] != 0) {
    return;
  } else if(accArray[obj.third.y][obj.third.x+flag] != 0) {
    return;
  }else if(accArray[obj.fourth.y][obj.fourth.x+flag] != 0) {
    return;
  }
  //变化
  obj.leftPos += flag;
  obj.rightPos += flag;
  obj.first.x += flag;
  obj.second.x += flag;
  obj.third.x += flag;
  obj.fourth.x += flag;
  drawModle(obj);
};

//方块上移
function goUp(obj,n)
{
  obj.topPos -= n;
  obj.bottomPos -= n;
  obj.first.y -= n;
  obj.second.y -= n;
  obj.third.y -= n;
  obj.fourth.y = n;
}

//方块下落
function falling(obj, down)
{
  var stop = false; //方块的下面有方块就停止，不算上到达底部的情况
  var db = 1;
  //加速下落,一次下降两格
  if(down) 
  { 
    db = down;
    var cn = 2;
    if(obj.bottomPos == 19) {
      cn = 1;
    }
    //如果下方两格的地方已经存在方块，那么只能下降一格
    if(accArray[obj.first.y+cn][obj.first.x] != 0) {
      db = 1;
    }
    if(accArray[obj.second.y+cn][obj.second.x] != 0) {
      db = 1;
    }
    if(accArray[obj.third.y+cn][obj.third.x] != 0) {
      db = 1;
    }
    if(accArray[obj.fourth.y+cn][obj.fourth.x] != 0) {
      db = 1;
    }
  }
  if(obj.bottomPos > 20-heapHighest-1)//在堆积的最高的方块的上面不用检测obj下方有没有方块
  {
    if(obj.bottomPos < 20) //不算上落到底部的情况
    {
      //检查正在下落的方块下方有没有方块，有就停止
      if(accArray[obj.first.y+1][obj.first.x] != 0) {
        stop = true;
      }
      if(accArray[obj.second.y+1][obj.second.x] != 0) {
        stop = true;
      }
      if(accArray[obj.third.y+1][obj.third.x] != 0) {
        stop = true;
      }
      if(accArray[obj.fourth.y+1][obj.fourth.x] != 0) {
        stop = true;
      }
    }
  }
  if(stop) //如果下方有方块，停止正在下落的方块
  {
    clearInterval(timer);
    if(20-obj.topPos > heapHighest) {
      heapHighest = 20 - obj.topPos;
    }
    accumulate(obj);         //将其加入数组
    if(heapHighest == 20)		 //方块堆积到顶部，游戏结束并且可以重新开始游戏
    {
      gameContinue = false;
      playGame = true;		   //可以再次开始游戏
      finalScore.innerHTML = score;
      showPopup(scorePopup); //弹出得分提示框
      clearArray();          //清楚数组中已经堆积的方块
    } else {
      randomNewModle();      //重新出现以一个方块
    }
  }
  if(!stop && heapHighest!=20)  //下方没有碰到方块继续下落，并且没有累积到顶部
  {
    obj.topPos += db;
    obj.bottomPos += db;
    obj.first.y += db;  
    obj.second.y += db;  
    obj.third.y += db;  
    obj.fourth.y += db;
    drawModle(obj);
  }  
  if(obj.bottomPos == 20 && !stop) //只是到达底部的情况
  {
    if(20-obj.topPos > heapHighest){
      heapHighest = 20 - obj.topPos;
    }
    accumulate(obj);
    randomNewModle();
  }
};

//显示Modle的四个组成方块
function drawModle(obj)
{
  obj.first.drawSquare();
  obj.second.drawSquare();
  obj.third.drawSquare();
  obj.fourth.drawSquare();
 /* obj.first.node.innerHTML=1;
  obj.second.node.innerHTML=2;
  obj.third.node.innerHTML=3;
  obj.fourth.node.innerHTML=4; */
}

/**
 * 出现在预览区域的方块
 * @class
 * @constructor
 */
function PreviewSquare()
{
  this.one = createSquareNode(previewContent);
  this.tow = createSquareNode(previewContent);
  this.three = createSquareNode(previewContent);
  this.four = createSquareNode(previewContent);
  this.one.style.display = 'none';
  this.tow.style.display = 'none';
  this.three.style.display = 'none';
  this.four.style.display = 'none';
}
PreviewSquare.prototype.displayOrHideen = function(display)
{
  this.one.style.display = display;
  this.tow.style.display = display;
  this.three.style.display = display;
  this.four.style.display = display;
}
//出现在预览区域的方块
PreviewSquare.prototype.showPreviewSquare = function(num)
{
  switch(num)
  {
    case 0: this.one.style.left = this.three.style.left = '60px';
            this.tow.style.left = this.four.style.left = '90px';
            this.one.style.top=this.tow.style.top='30px';
            this.three.style.top=this.four.style.top= '60px';
        break;
    case 1: this.one.style.left = '30px';
            this.tow.style.left = '60px';
            this.three.style.left = '90px';
            this.four.style.left = '120px';
            this.one.style.top=this.tow.style.top=this.three.style.top=this.four.style.top= '45px';
        break;
    case 2: this.one.style.left = '45px';
            this.tow.style.left = this.three.style.left = '75px';
            this.four.style.left = '105px';
            this.one.style.top=this.tow.style.top='30px';
            this.three.style.top=this.four.style.top= '60px';
        break;
    case 3: this.one.style.left = '105px';
            this.tow.style.left = this.three.style.left = '75px';
            this.four.style.left = '45px';
            this.one.style.top=this.tow.style.top='30px';
            this.three.style.top=this.four.style.top= '60px';
        break;
    case 4: this.one.style.left = this.tow.style.left = '45px';
            this.three.style.left = '75px';
            this.four.style.left = '105px';
            this.one.style.top='30px';
            this.tow.style.top=this.three.style.top=this.four.style.top='60px';
        break;
    case 5: this.one.style.left = this.tow.style.left = '105px';
            this.three.style.left = '75px';
            this.four.style.left = '45px';
            this.one.style.top='30px';
            this.tow.style.top=this.three.style.top=this.four.style.top='60px';
        break;
    case 6: this.one.style.left = this.tow.style.left = '75px';
            this.three.style.left = '45px';
            this.four.style.left = '105px';
            this.tow.style.top='30px';
            this.one.style.top=this.three.style.top=this.four.style.top='60px';
        break;
  }
  //设置预览方块的背景颜色
  this.one.style.backgroundColor=this.tow.style.backgroundColor=modleColor[num];
  this.three.style.backgroundColor=this.four.style.backgroundColor=modleColor[num];
}

/**
 * @class Square 
 * @constructor
 * @param {number} x - 
 * @param {number} y - 
 */
function Square(x, y)
{
	this.node = createSquareNode(moveArea); //使用一个元素节点作为方块的载体
	this.x = x;								//方块的横坐标
	this.y = y; 							//方块的纵坐标
}
Square.prototype.drawSquare = function() //将方块显示在moveArea中
{
	this.node.style.left = this.x*30 + 'px';
	this.node.style.top = this.y*30 + 'px';
}; 
/**
 * @class Modle
 * @constructor
 */
function Modle()
{
	this.first = null;	  //定位的方块
	this.second = null;
	this.third = null;
	this.fourth = null;
	this.shape = 0;       //表示模块的形状
	this.condition = 0;   //表示当前模块的状态 ，模块有四种方向
	this.leftPos = 0;     //最左边的方块的坐标
	this.rightPos = 0;    //最右边的方块的坐标
  this.topPos = 0;      //顶部方块的坐标
	this.bottomPos = 0;   //代表最底部的方块的坐标
	this.bgColor = 0;     //整体的背景颜色
}
/**
 * Modle_0 到 Modle_6 都是继承 Modle类
 */
//形状 0
function Modle_0()
{
  Modle.call(this);
  this.first = new Square(4,0);
  this.second = new Square(5,0);
  this.third = new Square(4,1);
  this.fourth = new Square(5,1);
  this.shape = 0;
  this.leftPos = 4;
  this.rightPos = 6;
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 0;
  setColor(this);
}
Modle_0.prototype.turn = function()
{
  //正方形的方块不用转向
  return;
};
//形状 1
function Modle_1()
{
  Modle.call(this);
  this.first = new Square(3,0);
  this.second = new Square(4,0);
  this.third = new Square(5,0);
  this.fourth = new Square(6,0);
  this.shape = 1;
  this.leftPos = 3;
  this.rightPos = 7;
  this.bottomPos = 1;//y
  this.topPos = 0;
  this.bgColor = 1;
  setColor(this);
}
Modle_1.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos > 18) {
              var n = this.bottomPos==19 ? 1 :2;
              goUp(this,n);
            }
            if(this.topPos == 0) {
              falling(this);
            }
           this.first.x += 1;
           this.first.y -= 1;
           this.second.x=this.third.x=this.fourth.x = this.first.x;
           this.second.y = this.first.y+1;
           this.third.y = this.first.y+2;
           this.fourth.y = this.first.y+3;
           this.leftPos = this.first.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  	case 1: if(this.leftPos == 0) {
              move(this, 'right');
            }
            if(this.rightPos == 9) {
               move(this, 'left');
            }
            if(this.rightPos == 10) {
               move(this, 'left');
               move(this, 'left');
             }
           this.first.x -= 1;
           this.first.y += 1;
           this.second.y=this.third.y=this.fourth.y = this.first.y;
           this.second.x = this.first.x+1;
           this.third.x = this.first.x+2;
           this.fourth.x = this.first.x+3;
           this.leftPos = this.first.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.first.y+1;
           this.topPos = this.first.y;
  		break;
  }
  this.condition = (this.condition+1)%2;
  drawModle(this);
};
//形状 2
function Modle_2()
{
  Modle.call(this);
  this.first = new Square(4,0);
  this.second = new Square(5,0);
  this.third = new Square(5,1);
  this.fourth = new Square(6,1);
  this.shape = 2;
  this.leftPos = 4;
  this.rightPos = 7;
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 2;
  setColor(this);
}
Modle_2.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos == 20) {
              goUp(this,1);
            }
           this.first.x += 2;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.first.x - 1;
           this.fourth.x = this.first.x - 1;
           this.second.y = this.first.y+1;
           this.third.y = this.first.y+1;
           this.fourth.y = this.first.y+2;
           this.leftPos = this.third.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  	case 1:if(this.leftPos == 0) {
              move(this, 'right');
            }
           this.first.x -= 2;
           this.first.y += 0;
           this.second.x = this.first.x+1;
           this.second.y = this.first.y;
           this.third.x = this.first.x+1;
           this.fourth.x = this.first.x+2;
           this.third.y=this.fourth.y = this.first.y + 1;
           this.leftPos = this.first.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  }
  this.condition = (this.condition+1)%2;
  drawModle(this);
};
//形状 3
function Modle_3()
{
  Modle.call(this);
  this.first = new Square(6,0);
  this.second = new Square(5,0);
  this.third = new Square(5,1);
  this.fourth = new Square(4,1);
  this.shape = 3;
  this.leftPos = 4;
  this.rightPos = 7;
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 3;
  setColor(this);
}
Modle_3.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos == 20) {
              goUp(this,1);
            }
           this.first.x -= 2;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.fourth.x = this.first.x + 1;
           this.second.y = this.third.y = this.first.y+1;
           this.fourth.y = this.first.y+2;
           this.leftPos = this.first.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  	case 1:if(this.rightPos == 10) {
               move(this, 'left');
            }
           this.first.x += 2;
           this.first.y += 0;
           this.second.x = this.third.x = this.first.x-1;
           this.fourth.x = this.first.x-2;
           this.second.y = this.first.y;
           this.third.y = this.fourth.y = this.first.y + 1;
           this.leftPos = this.fourth.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  }
  this.condition = (this.condition+1)%2;
  drawModle(this);
};
//形状 4
function Modle_4()
{
  Modle.call(this);
  this.first = new Square(4,0);
  this.second = new Square(4,1);
  this.third = new Square(5,1);
  this.fourth = new Square(6,1);
  this.shape = 4;
  this.leftPos = 4;
  this.rightPos = 7;
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 4;
  setColor(this);
}
Modle_4.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos == 20) {
              goUp(this,1);
            }
           this.first.x += 2;
           this.first.y += 0;
           this.second.x = this.third.x = this.fourth.x = this.first.x-1;
           this.second.y = this.first.y;
           this.third.y = this.first.y+1;
           this.fourth.y = this.first.y+2;
           this.leftPos = this.second.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
  	case 1:if(this.leftPos == 0) {
              move(this, 'right');
            }
           this.first.x += 0;
           this.first.y += 2;
           this.second.x = this.first.x;
           this.third.x = this.first.x-1;
           this.fourth.x = this.first.x-2;
           this.second.y = this.third.y = this.fourth.y = this.first.y - 1;
           this.leftPos = this.fourth.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.first.y+1;
           this.topPos = this.fourth.y;
  		break;
  	case 2:this.first.x -= 2;
           this.first.y += 0;
           this.second.x = this.third.x = this.fourth.x = this.first.x+1;
           this.second.y = this.first.y;
           this.third.y = this.first.y-1;
           this.fourth.y = this.first.y-2;
           this.leftPos = this.first.x;
           this.rightPos = this.second.x+1;
           this.bottomPos = this.second.y+1;
           this.topPos = this.fourth.y;
  		break;
    case 3:if(this.rightPos == 10) {
               move(this, 'left');
             }
           this.first.x += 0;
           this.first.y -= 2;
           this.second.x = this.first.x;
           this.third.x = this.first.x+1;
           this.fourth.x = this.first.x+2;
           this.second.y = this.third.y = this.fourth.y = this.first.y + 1;
           this.leftPos = this.first.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
      break;
  }
  this.condition = (this.condition+1)%4;
  drawModle(this);
};
//形状 5
function Modle_5()
{
  Modle.call(this);
  this.first = new Square(6,0);
  this.second = new Square(6,1);
  this.third = new Square(5,1);
  this.fourth = new Square(4,1);
  this.shape = 5;
  this.leftPos = 4;
  this.rightPos = 7;
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 5;
  setColor(this);
}
Modle_5.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos == 20) {
              goUp(this,1);
            }
           this.first.x += 0;
           this.first.y += 2;
           this.second.x = this.third.x = this.fourth.x = this.first.x-1;
           this.second.y = this.first.y;
           this.third.y = this.first.y-1;
           this.fourth.y = this.first.y-2;
           this.leftPos = this.second.x;
           this.rightPos = this.first.x+1;
           this.bottomPos = this.second.y+1;
           this.topPos = this.fourth.y;
  		break;
  	case 1:if(this.leftPos == 0) {
              move(this, 'right');
            }
           this.first.x -= 2;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.first.x+1;
           this.fourth.x = this.first.x+2;
           this.second.y = this.third.y = this.fourth.y = this.first.y - 1;
           this.leftPos = this.first.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.first.y+1;
           this.topPos = this.fourth.y;
  		break;
  	case 2:this.first.x += 0;
           this.first.y -= 2;
           this.second.x = this.third.x = this.fourth.x = this.first.x+1;
           this.second.y = this.first.y;
           this.third.y = this.first.y+1;
           this.fourth.y = this.first.y+2;
           this.leftPos = this.first.x;
           this.rightPos = this.second.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.first.y;
  		break;
    case 3:if(this.rightPos == 10) {
               move(this, 'left');
           }
           this.first.x += 2;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.first.x-1;
           this.fourth.x = this.first.x-2;
           this.second.y = this.third.y = this.fourth.y = this.first.y + 1;
           this.leftPos = this.fourth.x;
           this.rightPos = this.second.x+1;
           this.bottomPos = this.second.y+1;
           this.topPos = this.first.y;
      break;
  }
  this.condition = (this.condition+1)%4;
  drawModle(this);
};
//形状 6 
function Modle_6()
{
  Modle.call(this);
  this.first = new Square(5,1);
  this.second = new Square(5,0);
  this.third = new Square(4,1);
  this.fourth = new Square(6,1);
  this.shape = 6;
  this.leftPos = 4;
  this.rightPos = 7; 
  this.bottomPos = 2;//y
  this.topPos = 0;
  this.bgColor = 6;
  setColor(this);
}
Modle_6.prototype.turn = function()
{
  switch (this.condition)
  {
  	case 0:if(this.bottomPos == 20) {
              goUp(this,1);
            }
           this.first.x += 0;
           this.first.y += 0;
           this.second.x = this.first.x+1;
           this.third.x = this.fourth.x = this.first.x;
           this.second.y = this.first.y;
           this.third.y = this.first.y-1;
           this.fourth.y = this.first.y+1;
           this.leftPos = this.first.x;
           this.rightPos = this.second.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.third.y;
  		break;
  	case 1:if(this.leftPos == 0) {
              move(this, 'right');
            }
           this.first.x += 0;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.first.x+1;
           this.fourth.x = this.first.x-1;
           this.second.y =  this.first.y+1;
           this.third.y = this.fourth.y = this.first.y;
           this.leftPos = this.fourth.x;
           this.rightPos = this.third.x+1;
           this.bottomPos = this.second.y+1;
           this.topPos = this.first.y;
  		break;
  	case 2:this.first.x += 0;
           this.first.y += 0;
           this.second.x = this.first.x-1;
           this.third.x = this.fourth.x = this.first.x;
           this.second.y = this.first.y;
           this.third.y = this.first.y+1;
           this.fourth.y = this.first.y-1;
           this.leftPos = this.second.x;
           this.rightPos = this.third.x+1;
           this.bottomPos = this.third.y+1;
           this.topPos = this.fourth.y;
  		break;
    case 3:if(this.rightPos == 10) {
               move(this, 'left');
           }
           this.first.x += 0;
           this.first.y += 0;
           this.second.x = this.first.x;
           this.third.x = this.first.x-1;
           this.fourth.x = this.first.x+1;
           this.second.y = this.first.y-1;
           this.third.y = this.fourth.y = this.first.y;
           this.leftPos = this.third.x;
           this.rightPos = this.fourth.x+1;
           this.bottomPos = this.fourth.y+1;
           this.topPos = this.second.y;
      break;
  }
  this.condition = (this.condition+1)%4;
  drawModle(this);
};

//开起方块预览，随机出现下一个方块
function restartPreview()
{
  nowNum = nextNum;
  preview.showPreviewSquare(nextNum);
  nextNum = Math.round(Math.random()*6);
}

//随机出现一个新的方块
function randomNewModle()
{
  clearInterval(timer);
  switch (nowNum)
  {
    case 0: nowModle = new Modle_0(); break;
    case 1: nowModle = new Modle_1(); break;
    case 2: nowModle = new Modle_2(); break;
    case 3: nowModle = new Modle_3(); break;
    case 4: nowModle = new Modle_4(); break;
    case 5: nowModle = new Modle_5(); break;
    case 6: nowModle = new Modle_6(); break;
  }
  totalArray.push(nowModle.first);
  totalArray.push(nowModle.second);
  totalArray.push(nowModle.third);
  totalArray.push(nowModle.fourth);
  
  restartPreview();
  drawModle(nowModle);
  timer = setInterval(function()
  {
    if(gameContinue) 			   //游戏是否暂停
    {
      falling(nowModle);		   //现在的方块下落
    }
  },fallingSpeed);
}

  var operationTipsBtn = document.getElementById('operationTipsBtn');//游戏操作提示按钮
  var operationTipsContent = document.getElementById('operationTipsContent');//游戏操作提示内容
  var previewBtn = document.getElementById('previewBtn');    //游戏方块预览按钮
  var showScoreBtn = document.getElementById('showScoreBtn');//游戏分数显示按钮
  var scoreContent = document.getElementById('scoreContent');//游戏分数内容
  var startGameBtn = document.getElementById('startGameBtn') //开始游戏按钮
  
  operationTipsBtn.showOr = false; //游戏操作提示默认隐藏
  previewBtn.showOr = true;        //方块预览区域默认显示
  showScoreBtn.showOr = true;      //分数显示区域默认显示
  
  preview = new PreviewSquare(); //实例化方块预览
  
  //展开和收起显示框
  function showOrHidden(btn,content,height)
  {
    if(btn.showOr) 
    {
      btn.showOr = false;
      startMove(content,{"height":0});
      content.style.display = 'none';
    } else {
      btn.showOr = true;
      content.style.display = 'block';
      startMove(content,{"height":height});
    }
  }
  //展开和收起游戏操作提示
  operationTipsBtn.onclick = function()
  {
    showOrHidden(this,operationTipsContent,118);
  };
  //展开和收起游戏方块预览
  previewBtn.onclick = function()
  {
     showOrHidden(this,previewContent,118);
  };
  //展开和收起游戏分数显示
  showScoreBtn.onclick = function()
  {
    showOrHidden(this,scoreContent,88);
  };
  
  //点击开始游戏按钮
  startGameBtn.onclick = function()
  {
    if(playGame)
    {
      score = 0;
      eatingFoodNum = 0;
      heapHighest = 0;
      clearLine.innerHTML = 0;
      currentScore.innerHTML = 0;
      gameContinue = true;
      playGame = false;				 //游戏结束一局时赋值为true
      preview.displayOrHideen('block');//将预览的方块显示出来
      randomNewModle();				 //随机出现一个方块，游戏开始
    }
  };
  /**
   * 键盘控制方块的移动和旋转
   * 回车键可以开始游戏
   * 方向键上键和空格键都可以旋转方块
   * 方向键下键可以加速下落
   */
  document.onkeydown = function(ev)
  {
    var oEvent = ev || window.event;
    if(playGame) {		//没有开始游戏之前按键不响应
      return;
    }
    if(oEvent.keyCode == 17) {
      gameContinue = !gameContinue;//ctrl键可以暂停、继续游戏
    }
    if(!gameContinue) { //游戏暂停时间按键不响应
      return;
    }
    switch (oEvent.keyCode)
    {
      case 13: startGameBtn.onclick();          return false; break;//回车键可以开始游戏
      case 32: nowModle.turn();                 return false; break;//空格键可以旋转方块
      case 37: if(nowModle.leftPos>0) {
                  move(nowModle, 'left');
                }
        break;
      case 38: nowModle.turn();          break;//方向键上键可以旋转方块 
      case 39: if(nowModle.rightPos<10) {
                move(nowModle, 'right');
               }
        break;
      case 40: if(nowModle.bottomPos<19) {
                  falling(nowModle, 2);//倍速下落
                } else if(nowModle.bottomPos == 19) {
                  falling(nowModle, 1);
                }
        break;
      default:  break;
    }
  };
