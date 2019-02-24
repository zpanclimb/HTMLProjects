
var nowMap = [];//当前的地图关卡
var compareMap = [];//用作过关比较的数组
var aSpanArray = [];//地图元素span的数组
var backStepInstance = new BackStepStack(10);//自定义退步栈
var passingPanelCopy = null;//过关提示界面引用副本
var tipsContentCopy = null;//提示现在是多少关引用副本

var backStepButton = false;//是否要退一步
var pass = false;//是否过关了
var up = false; //上方向键
var down = false; //下方向键
var left = false; //左方向键
var right = false; //右方向键

var totalMapQuantity = 10;
var nowLevel = 1;//当前是第几关
var row_Col = 12;//地图的行和列数目

/**
 * @class 
 * @description this is a stack which used to put history step 
 * @param {number} length - fixed length of stack
 * @example var myStack = new BackStepStack(10);
 */
function BackStepStack(length)
{
  this.stepStack = new Array(length);
  this.length = length;
  this.size = 0;
  this.top = 0;
}
BackStepStack.prototype.pushStack = function(obj)
{
  
  this.stepStack[this.top] = obj;
  this.top = (this.top+1) % this.length;
  if(this.size < this.length)
  {
    this.size++;
  }
};
BackStepStack.prototype.popStack = function()
{
  var step = null;
  if(this.size > 0)
  {
    this.top -= 1;
    if(this.top == -1)
    {
      this.top = this.length - 1;
    }
    step = this.stepStack[this.top];
    this.stepStack[this.top] = 0;
    this.size--;
  }
  return step;
};
BackStepStack.prototype.sizeOf = function()
{
  return this.size;
};

//复制移动前的地图并压栈
function copyMapForBackStep()
{
  var tempMap = [];
  for(var i=0;i<row_Col;i++) {
    tempMap[i] = [];
  }
  copyMap(tempMap,nowMap);//复制一份
  backStepInstance.pushStack(tempMap);//入栈
}

//实现退回上一步
function realizeBackStep()
{
  copyMap(nowMap,backStepInstance.popStack());//出栈
}

//单纯的复制地图
function copyMap(newMap, oldMap)
{
  for(var i=0;i<row_Col;i++)
  {
    for(var j=0;j<row_Col;j++)
    {
      newMap[i][j] = oldMap[i][j];
    }
  }
}

//从原始地图复制到当前地图
function copyOriginalMap(level)
{
  var oMap = null;
  switch(level)
  {
    case 1 : oMap = map1;  break;
    case 2 : oMap = map2;  break;
    case 3 : oMap = map3;  break;
    case 4 : oMap = map4;  break;
    case 5 : oMap = map5;  break;
    case 6 : oMap = map6;  break;
    case 7 : oMap = map7;  break;
    case 8 : oMap = map8;  break;
    case 9 : oMap = map9;  break;
    case 10 : oMap = map10;  break;
  }
  for(var i=0;i<row_Col;i++)
  {
    nowMap[i] = [];//将nowMap创建二维数组
    compareMap[i] = [];//将compareMap创建二维数组
    for(var j=0;j<row_Col;j++)
    {
      nowMap[i][j] = oMap[i][j];//原始地图复制到当前操作的地图
      compareMap[i][j] = oMap[i][j];//原始地图复制到过关比较的地图
    }
  }
}

//设置地图元素的背景
function setMapELeBackground(oEle,num)
{
  switch(num)
  {
    case 0: oEle.style.background = 'url(img/ground.png)';
      break;
    case 1: oEle.style.background = 'url(img/wall.png)';
      break;
    case 3: oEle.style.background = 'url(img/terminal.png)';
      break;
    case 4:oEle.style.background = 'url(img/box.png)';
      break;
    case 5:oEle.style.background = 'url(img/man.png)';
      break;
    case 7:oEle.style.background = 'url(img/boxArrival.png)';
      break;
    case 8:oEle.style.background = 'url(img/man.png)';
      break;
  }
}

//控制人物的移动
function move()			//控制移动的方法，包含退步和上下左右的移动
 {	 
  var r = 0;
  var c = 0;		//人所在的行和列
  for(var i=0;i<row_Col;i++)	//定位到人的位置
  {
     for(var j=0;j<row_Col;j++)
     {
       if(nowMap[i][j]==5 || nowMap[i][j]==8)
       {
         r = i;
         c = j;
         break;
       }
     }
  }
  if(backStepButton)		//点击退回上一步按钮
  {
    if(backStepInstance.sizeOf()>0) 
    {
      realizeBackStep();
    }
    backStepButton = false;
  }					 	
  else if(up)	//上移
  {		
    if(nowMap[r-1][c]==0||nowMap[r-1][c]==3)
    {
      copyMapForBackStep();
      nowMap[r][c]-=5;
      nowMap[r-1][c]+=5;
    }
    else if(nowMap[r-1][c]==4||nowMap[r-1][c]==7)
    {
      if(nowMap[r-2][c]==0||nowMap[r-2][c]==3)
      {
        copyMapForBackStep();
        nowMap[r-2][c]+=4;
        nowMap[r-1][c]+=1;
        nowMap[r][c]-=5;		
      }
    }
  }
  else if(down)	//下移
  {
    if(nowMap[r+1][c]==0||nowMap[r+1][c]==3)
    {
      copyMapForBackStep();
      nowMap[r][c]-=5;
      nowMap[r+1][c]+=5;
    }
    else if(nowMap[r+1][c]==4||nowMap[r+1][c]==7)
    {
      if(nowMap[r+2][c]==0||nowMap[r+2][c]==3)
      {
        copyMapForBackStep();
        nowMap[r+2][c]+=4;
        nowMap[r+1][c]+=1;
        nowMap[r][c]-=5;
      }
    }
  }
  else if(left)	//左移
  {
    if(nowMap[r][c-1]==0||nowMap[r][c-1]==3)
    {
      copyMapForBackStep();
      nowMap[r][c]-=5;
      nowMap[r][c-1]+=5;
    }
    else if(nowMap[r][c-1]==4||nowMap[r][c-1]==7)
    {
      if(nowMap[r][c-2]==0||nowMap[r][c-2]==3)
      {
        copyMapForBackStep();
        nowMap[r][c-2]+=4;
        nowMap[r][c-1]+=1;
        nowMap[r][c]-=5;
      }
    }
  }
  else if(right)	//右移
  {
    if(nowMap[r][c+1]==0||nowMap[r][c+1]==3)
    {
      copyMapForBackStep();
      nowMap[r][c]-=5;
      nowMap[r][c+1]+=5;
    }
    else if(nowMap[r][c+1]==4||nowMap[r][c+1]==7)
    {
      if(nowMap[r][c+2]==0||nowMap[r][c+2]==3)
      {
        copyMapForBackStep();
        nowMap[r][c+2]+=4;
        nowMap[r][c+1]+=1;
        nowMap[r][c]-=5;	
      }
    }
  }
  up = false; //上方向键
  down = false; //下方向键
  left = false; //左方向键
  right = false;//右方向键
  judgePassOr();//判断是否过关了
}

//重画地图
function drawMap()
{
  for(var i=0;i<row_Col;i++)
  {
    for(var j=0;j<row_Col;j++)
    {
      setMapELeBackground(aSpanArray[i][j],nowMap[i][j]);
    }
  }
}

//判断是否过关
function judgePassOr()
{	
  out:for(var i=0; i<row_Col; i++)
  {
    for(var j=0; j<row_Col; j++)
    {
      if(compareMap[i][j]==3 || compareMap[i][j]==8)
      {
        //原始地图是目的地的位置当前地图是箱子在目的地即为过关
        if(nowMap[i][j] == 7) {	
          pass=true;
        } else {
          pass=false;
          break out;
        }
      }
    }
  }
  if(pass)
  {
    if(nowLevel<totalMapQuantity)
    {
      nowLevel++;
      copyOriginalMap(nowLevel);
      tipsContentCopy.innerHTML = '现在是第 '+nowLevel+' 关，共 '+totalMapQuantity+' 关';
      showTips(passingPanelCopy);
      pass = false;
    }
  }
  return pass;
}

//弹出提示框，过关、错误
function showTips(oEle)
{
  var okayBtn = oEle.getElementsByTagName('input')[0];
  var oDiv = oEle.getElementsByTagName('div')[0];
  oEle.style.display = 'block';
  startMove(oEle,{"opacity":100,"width":400,"height":250});
  startMove(oDiv,{"opacity":100,"width":385,"height":50});
  okayBtn.onclick = function()
  {
    startMove(oEle,{"opacity":0,"width":0,"height":0},function(){
      startMove(oDiv,{"opacity":0,"width":0,"height":0});
      oEle.style.display = 'none';
    });
  };
}

window.onload = function()
{
  var mapArea = document.getElementById('mapArea');//显示地图的区域
  var timer = null;//定时刷新地图
  var tipsContent = document.getElementById('tipsContent');//提示现在是多少关
  var mapLevelText = document.getElementById('mapLevelText');//输入选关数目的文本框
  var chooseLevelBtn = document.getElementById('chooseLevelBtn');//确认选关按钮
  var directionUp = document.getElementById('directionUp');//上方向键
  var directionLeft = document.getElementById('directionLeft');//左方向键
  var directionDown = document.getElementById('directionDown');//下方向键
  var directionRight = document.getElementById('directionRight');//右方向键
  var previousStep =document.getElementById('previousStep');//退回上一步按钮
  var replay = document.getElementById('replay')//重玩本关按钮
  var nextLevel = document.getElementById('nextLevel');//下一关按钮
  var passingPanel = document.getElementById('passingPanel');//过关提示界面
  var chooseLevelErrorPanel = document.getElementById('chooseLevelErrorPanel');//选关输入参数错误提示界面
  
  passingPanelCopy = passingPanel;//复制一份引用
  tipsContentCopy = tipsContent;//复制一份引用
  
  copyOriginalMap(nowLevel);//复制一份原始地图
  
  //将创建好的地图元素添加到地图显示区域
  for(var i=0;i<row_Col;i++)
  {
    aSpanArray[i] = [];//将aSpanArray创建二维数组
    for(var j=0;j<row_Col;j++)
    {
      var oSpan = document.createElement('span');
      aSpanArray[i][j] = oSpan;
      oSpan.className = 'mapElement';
      setMapELeBackground(oSpan,nowMap[i][j]);//设置地图元素背景
      mapArea.appendChild(oSpan);
    }
  }
  
  chooseLevelBtn.onclick = function()//选关按钮
  {
    var levelStr = mapLevelText.value;//字符串的关卡数
    var levelNum = parseInt(levelStr);//转为数字类型
    if(levelStr=='' || levelNum<1 || levelNum>10)
    {
      showTips(chooseLevelErrorPanel);
    } else {
      nowLevel = levelNum;
      copyOriginalMap(nowLevel);
    }
  };
  
  directionUp.onclick = function()
  {
    up = true;
    move();
  };
  directionLeft.onclick = function()
  {
    left = true;
    move();
  };
  directionDown.onclick = function()
  {
    down = true;
    move();
  };
  directionRight.onclick = function()
  {
    right = true;
    move();
  };
  previousStep.onclick = function()//退回上一步按钮
  {
    backStepButton = true;
    move();
  };
  replay.onclick = function()//重玩本关按钮
  {
    copyMap(nowMap, compareMap);
  };
  nextLevel.onclick = function()//下一关按钮
  {
    if(nowLevel<totalMapQuantity)
    {
      nowLevel++;
      copyOriginalMap(nowLevel);
      tipsContent.innerHTML = '现在是第 '+nowLevel+' 关，共 '+totalMapQuantity+' 关';
    }
  };
  
  document.onkeydown = function(ev)
  {
    var oEvent = event || ev;
    switch(oEvent.keyCode)
    {
      case 37: directionLeft.onclick(); break;
      case 38: directionUp.onclick(); break;
      case 39: directionRight.onclick(); break;
      case 40: directionDown.onclick(); break;
    }
  }
  
  
  /* setInterval(function(){
    if(pass)
    {
      startMove(passingPanel);
    }
  },100); */
  //定时刷新地图
  timer = setInterval(drawMap,30);
};