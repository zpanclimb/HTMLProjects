
/* ============= 网页版贪吃蛇JavaScript代码 ============== */

var nodeSize = 30;    //蛇身节点的大小
var ROWS = 17;        //行数目
var COLS = 20;        //列数目
var eatingFoodNum = 0;//吃的食物的数量
var playCount = 1;    //游戏次数
var difficult = 200;  //默认游戏难度为一般难度
var live = false;     //蛇的生命
var turnDirection = true; //是否可以转向，解决手速过快直接方向移动

var headColor = '#EB187C';//蛇头的颜色
var bodyColor = '#008040';//蛇身的颜色
var foodColor = '#55027D';//食物的颜色

var timer = null;
var moveArea = document.getElementById('moveArea');   //蛇移动的界面
var scoreTips = document.getElementById('scoreTips'); //游戏结束提示框
var score = document.getElementById('score');         //游戏结束之后显示分数

var operationTipsBtn = document.getElementById('operationTipsBtn');        //游戏操作提示按钮
var operationTipsContent = document.getElementById('operationTipsContent');//游戏操作提示内容

var historyScoreBtn = document.getElementById('historyScoreBtn');          //显示历史最高分按钮
var historyScoreContent = document.getElementById('historyScoreContent');  //历史最高分内容
var afourHistoryScore = historyScoreContent.getElementsByTagName('p');	   //四个难度的历史最高分


var showCurrentScoreBtn = document.getElementById('showCurrentScoreBtn');  //实时分数按钮
var currentScoreContent = document.getElementById('currentScoreContent');  //显示实时分数内容的容器
var currentScore = document.getElementById('currentScore');           	   //实时分数内容

var startGameBtn = document.getElementById('startGame');    //开始游戏按钮
var chooseLevelBtn = document.getElementById('chooseLevel');//选择游戏难度妞妞

//难度弹出框以及里面的元素
var chooseLevelPanel = document.getElementById('chooseLevelPanel');   //难度选择按钮
var aDifficultyArray = chooseLevelPanel.getElementsByTagName('input');//四个难度选择按钮
aDifficultyArray[2].className = 'difficultyBtn_selected';             //默认一般难度

var direction = new Direction();//方向
var snake = null;
var food = null;

//弹出提示框，得分、选择游戏难度
function showTips(oEle)
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

//游戏结束
function stop(passGame)
{
  live = false;
  turnDirection = true;
  playCount++;
  clearInterval(timer);//清除定时器
  score.innerHTML = eatingFoodNum;//显示本次游戏分数
  if(passGame)
  {
    score.innerHTML = eatingFoodNum + ' 暴力通关';
  }
  //是否更新历史最高分数
  if(difficult == 250)//简单难度
  {
    if(eatingFoodNum > parseInt(afourHistoryScore[0].innerHTML))
    {
      afourHistoryScore[0].innerHTML = eatingFoodNum;
    }
  } 
  else if(difficult == 200) 
  {
    if(eatingFoodNum > parseInt(afourHistoryScore[1].innerHTML))
    {
      afourHistoryScore[1].innerHTML = eatingFoodNum;
    }
  }
  else if(difficult == 150) 
  {
    if(eatingFoodNum > parseInt(afourHistoryScore[2].innerHTML))
    {
      afourHistoryScore[2].innerHTML = eatingFoodNum;
    }
  }
  else if(difficult == 100) 
  {
    if(eatingFoodNum > parseInt(afourHistoryScore[3].innerHTML))
    {
      afourHistoryScore[3].innerHTML = eatingFoodNum;
    }
  }
  showTips(scoreTips);//弹出分数提示框
}

//创造一个元素节点span，作为蛇身节点的元素
function createElementNode()
{
  var oSpan = document.createElement('span');
  oSpan.className = 'nodeElement';
  moveArea.appendChild(oSpan);
  return oSpan;
}

/**
 * 枚举类：四个方向
 * @class [description] this is a class , enumeration for four directions
 */
function Direction()
{
	this.dir = {
		"up":"up",
		"down":"down",
		"left":"left",
		"right":"right",
	}; 
}

/**
 * 类：食物
 * @class [description] this is a class , snake's target,Food
 */
function Food()
{
	this.food_x = 0;//食物的横坐标
	this.food_y = 0;//食物的纵坐标
  this.foodElement = createElementNode();//代表食物所在的元素
}
Food.prototype.reAppear = function()      //食物被吃后重新出现
{
  this.randomPosition();
  for(var node=snake.head;node!=null;node=node.next_node)
  {
  	if(node.x==this.food_x &&　node.y==this.food_y)
  	{
  		this.randomPosition();
      node = snake.head;
  	} 
  }
  this.drawFood();
};
Food.prototype.randomPosition = function()//食物随机出现的位置
{
	this.food_x = Math.floor(Math.random()*20);
	this.food_y = Math.floor(Math.random()*17);
}
Food.prototype.drawFood = function()      //在界面上显示出食物
{
  this.foodElement.style.left = this.food_x * nodeSize + 'px';
  this.foodElement.style.top = this.food_y * nodeSize + 'px';
  this.foodElement.style.backgroundColor = foodColor;
};

/**
 * 类：蛇身节点，组成蛇的身体
 * @class [description] this is a class,snakeBody node 
 * @param {number} row - node's x 
 * @param {number} col - node's y 
 */
function BodyNode(x,y,dir)
{
	this.direction = dir; //节点方向
	this.x = x;           //节点的位置，横坐标
	this.y = y;           //节点的位置，纵坐标
	this.pre_node = null; //前一个节点
	this.next_node = null;//后一个节点
  this.elementNode = createElementNode();
  this.elementNode.style.left = this.x * nodeSize + 'px';
  this.elementNode.style.top = this.y * nodeSize + 'px';
}
BodyNode.prototype.drawNode = function()
{
    this.elementNode.style.left = this.x * nodeSize + 'px';
    this.elementNode.style.top = this.y * nodeSize + 'px';
};

/**
 * 类：蛇身
 * @class [description] this is a class , snakeBody
 */
function SnakeBody()
{
  var x = Math.floor(Math.random()*12)+4;//4 --- 16 头结点的坐标
  var y = Math.floor(Math.random()*11)+3;//3 --- 14
  var m = 0;//第二个节点的坐标
  var n = 0;
  var k = 0;//尾节点的坐标
  var l = 0;
  var dir = null;
  if(x < 10) {
    if(y < 8) {
      dir = direction.dir['right'];
      m = y;
      n = x-1;
      k = y;
      l = x-2;
    } else {
      dir = direction.dir['up'];
      m = x;
      n = y+1;
      k = x;
      l = y+2;
    }
  } else {
    if(y < 8) {
      dir = direction.dir['down'];
      m = x;
      n = y-1;
      k = x;
      l = y-2;
    } else {
      dir = direction.dir['left'];
      m = y;
      n = x+1;
      k = y;
      l = x+2;
    }
  }
  this.head = new BodyNode(x,y,dir);//蛇头
  this.middle = new BodyNode(m,n,dir);//第二个节点
  this.tail = new BodyNode(k,l,dir);//蛇尾
  /* this.tail = new BodyNode(m,n,dir);//蛇尾
	this.head.next_node = this.tail;
	this.tail.pre_node = this.head; */
	this.head.next_node = this.middle;
  this.middle.pre_node = this.head;
  this.middle.next_node = this.tail;
	this.tail.pre_node = this.middle;
}
SnakeBody.prototype.drawSnake = function()//画出蛇的身体
{
  this.move();
  turnDirection = true;
	for(var node = this.head; node != null; node = node.next_node) 
	{
		node.drawNode();
	}  
};
SnakeBody.prototype.move = function()     //蛇身移动
{
  /**
   * 蛇的移动,
   * 方法一就是蛇尾删除一个节点,蛇头增加一个节点，addToHead();加上deleteFromTail(); 这种方法还有问题没有解决
   * 方法二是直接将尾节点放到头部,tailSetHead()
   */
  // this.addToHead();		     //在蛇头增加一个节点
  this.tailSetHead();		  //直接将尾节点放到头部
  this.checkDead();		    //检查蛇是否撞墙或撞到自身
  this.eating();          //检查有没有吃到食物
  // this.deleteFromTail(); 	//从蛇尾删除一个节点
};
SnakeBody.prototype.tailSetHead = function()//直接将尾节点放到头部
{
  var node = this.tail;
  this.tail = node.pre_node;
  this.tail.next_node = null;
  switch(this.head.direction) 
  {
    case "left" :
      node.x = this.head.x - 1; 
      node.y = this.head.y;
      node.direction = this.head.direction;
      break;
    case "up" :
      node.x = this.head.x;
      node.y = this.head.y - 1;
      node.direction = this.head.direction;
      break;
    case "right":
      node.x = this.head.x + 1;
      node.y = this.head.y;
      node.direction = this.head.direction;
      break;
    case "down" :
      node.x = this.head.x;
      node.y = this.head.y + 1;
      node.direction = this.head.direction;
      break;
  }
  this.head.elementNode.style.backgroundColor=bodyColor;
  node.elementNode.style.backgroundColor=headColor;		//增加节点之后重新设置蛇头颜色
  node.next_node=this.head;
  this.head.pre_node=node;
  this.head=node;
};
/* SnakeBody.prototype.addToHead = function()//在头部之前插入节点,然后在尾部添加一个节点，这种方法实现移动还有一个问题没有解决
{
  var node = null;
  switch(this.head.direction) 
  {
    case "left" :
      node = new BodyNode(this.head.x - 1, this.head.y, this.head.direction);
      break;
    case "up" :
      node = new BodyNode(this.head.x, this.head.y - 1, this.head.direction);
      break;
    case "right":
      node = new BodyNode(this.head.x + 1, this.head.y, this.head.direction);
      break;
    case "down" :
      node = new BodyNode(this.head.x, this.head.y + 1, this.head.direction);
      break;
  }
  this.head.elementNode.style.backgroundColor=bodyColor;
  node.elementNode.style.backgroundColor=headColor;		//增加节点之后重新设置蛇头颜色
  node.next_node=this.head;
  this.head.pre_node=node;
  this.head=node;
}; */
SnakeBody.prototype.addToTail = function()//在尾部之后插入节点
{
  var node = null;
  switch(this.tail.direction) 
  {
    case "left" :
      node = new BodyNode(this.tail.x, this.tail.y + 1, this.tail.direction);
      break;
    case "up" :
      node = new BodyNode(this.tail.x + 1, this.tail.y, this.tail.direction);
      break;
    case "right" :
      node = new BodyNode(this.tail.x, this.tail.y - 1, this.tail.direction);
      break;
    case "down" :
      node = new BodyNode(this.tail.x - 1, this.tail.y, this.tail.direction);
      break; 
  }
  this.tail.next_node = node;
  node.pre_node = this.tail;
  this.tail = node;
};

SnakeBody.prototype.deleteFromTail = function()//删除尾巴
{
  this.tail = this.tail.pre_node;
  moveArea.removeChild(this.tail.next_node.elementNode);
  this.tail.next_node = null;
};
SnakeBody.prototype.checkDead = function()    //检查是否撞墙或撞到自身
{
  if(this.head.x < 0 || this.head.y < 0 || this.head.x == COLS || this.head.y == ROWS) 
  {
    stop();		  //蛇撞到墙
  }
  
  for(var node = this.head.next_node; node != null; node = node.next_node) 
  {
    if(this.head.x == node.x && this.head.y == node.y) 
    {
      stop();		//蛇撞到自身
    }
  }
};
SnakeBody.prototype.eating = function()   //蛇吃掉了食物
{
	if(this.head.x==food.food_x && this.head.y==food.food_y)
	{
    eatingFoodNum++;                      //吃到的食物数量
    currentScore.innerHTML =eatingFoodNum;//实时分数更新
    food.reAppear();                      //食物重新出现
    this.addToTail();                     //蛇身节点增加一个
    if(eatingFoodNum == 337)              //通关了
    {
        stop(true);
    }                    
	}
};

  
  //给游戏操作提示、历史最高分、实时分数三个按钮添加一个显示或隐藏的标志
  operationTipsBtn.showOr = false;  //隐藏
  historyScoreBtn.showOr = false;   //隐藏
  showCurrentScoreBtn.showOr = true;//显示
  
  //实例化蛇和食物
  snake = new SnakeBody();//蛇
  food = new Food();//食物
  
  //暂停游戏
  function pauseGame()
  {
    if(live) {
      live = false;
    } else {
      live = true;
    }
  }
  
  //游戏操作提示按钮
  operationTipsBtn.onclick = function()
  {
    if(operationTipsBtn.showOr) 
    {
      operationTipsBtn.showOr = false;
      startMove(operationTipsContent,{"height":0});
      operationTipsContent.style.display = 'none';
    } else {
      operationTipsBtn.showOr = true;
      operationTipsContent.style.display = 'block';
      startMove(operationTipsContent,{"height":58});
    }
  };
  //历史最高分按钮
  historyScoreBtn.onclick = function()
  {
    if(historyScoreBtn.showOr) 
    {
      historyScoreBtn.showOr = false;
      startMove(historyScoreContent,{"height":0});
      historyScoreContent.style.display = 'none';
    } else {
      historyScoreBtn.showOr = true;
      historyScoreContent.style.display = 'block';
      startMove(historyScoreContent,{"height":82});
    }
  };
  
  //显示实时分数按钮
  showCurrentScoreBtn.onclick = function()
  {
    if(showCurrentScoreBtn.showOr) 
    {
      showCurrentScoreBtn.showOr = false;
      startMove(currentScoreContent,{"height":0});
      currentScoreContent.style.display = 'none';
    } else {
      showCurrentScoreBtn.showOr = true;
      currentScoreContent.style.display = 'block';
      startMove(currentScoreContent,{"height":58});
    }
  };
  
  //点击开始游戏按钮
  startGameBtn.onclick = function()
  {
    if(!live)//死的时候才能够点击起作用
    {
      live = true;
      
      if(playCount> 1)//重新开始游戏
      {
        for(var node = snake.head; node != null; node = node.next_node) //将上次的蛇身节点移除掉
        {
          moveArea.removeChild(node.elementNode);
        }
        snake = new SnakeBody();//重新实例化一条蛇
      }
      food.reAppear();
      eatingFoodNum = 0;
      currentScore.innerHTML = 0;
      clearInterval(timer);
      timer = setInterval(function(){
        if(live)
        { 
          snake.drawSnake();
        }
      },difficult);
    }
  };
  
    //点击选择游戏难度按钮，弹出难度弹窗
  chooseLevelBtn.onclick = function()
  {
    showTips(chooseLevelPanel);//弹窗
    for(var i=1;i<aDifficultyArray.length;i++)
    {
      aDifficultyArray[i].index = i;
      aDifficultyArray[i].onclick = function()
      {
        for(var j=1;j<aDifficultyArray.length;j++)
        {
          aDifficultyArray[j].className = 'difficultyBtn';
        }
        this.className = 'difficultyBtn_selected';
        difficult = 250 - (this.index-1)*50;//250、200、150、100
      };
    }
  };
  
  //键盘监听实现蛇的移动
  document.onkeydown = function(ev) 	
  {
    var oEvent = window.event || ev;
    switch(oEvent.keyCode) 
    {
      case 37:		//在蛇头的方向为左时,不按左键可以变换方向
        if(snake.head.direction != direction.dir['right'])
        { 
          //解决手速过快造成方向移动
          if(turnDirection) { 
            snake.head.direction = direction.dir['left'];
          }
        }
        break;
      case 38:
        if(snake.head.direction != direction.dir['down'])
        {
          if(turnDirection){
            snake.head.direction = direction.dir['up'];
          }
        }
        break;
      case 39:
        if(snake.head.direction != direction.dir['left'])
        {
          if(turnDirection){
            snake.head.direction = direction.dir['right'];
          }
        }
        break;
      case 40:
        if(snake.head.direction != direction.dir['up'])
        {
          if(turnDirection){
            snake.head.direction = direction.dir['down'];
          }
        }
        break;
      case 13:  startGameBtn.onclick(); return false;  break;//回车键开始游戏
      case 32:  pauseGame();            return false;  break;//空格键暂停与继续游戏
    }
    turnDirection = false;
    // return false;
  }
