
;(function($,window){
  
  //默认三种难度，初级，中级，高级
  var difficult = [
    {'mineNum' : 10,//初级难度 雷数目 10  
      'wNum' : 9, 	//网格宽 9 个格子
      'hNum' : 9  	//网格高 9 个格子
    },
    {'mineNum' : 40,//中级难度
      'wNum' : 16,
      'hNum' : 16
    },
    {'mineNum' : 99,//高级难度
      'wNum' : 30,
      'hNum' : 16
    }
  ];
  //雷数字的颜色         1 蓝色			2 绿色		 3 橙红色		4 深蓝色  5 深红色  6 青色		 7 紫色			8 金色
	var fontColor = ['','#4876FF','#458B00','#CD6600','#27408B','#B22222','#48D1CC','#CD00CD','#EEC900'];
	
	const squareSize = 25;		//可点击正方形方块的大小，
	var squareArr = [],				//存放所有的方块
			minesPosSet = {}, 		//存放雷的位置信息的集合
			openedSet = {},				//存放已经打开的格子的集合
			surplusSquareNum = 0,	//当前剩余未翻开的方块的数目
			currentMineNum = 0,		//当前剩余的雷的数目
			gameBegin = true,
			nowLevel = null,			//当前的等级难度
			timer = null; 				//游戏时间计时器
	
	//对扫雷的盘子的进布局
	function layoutBoard(attr)
	{
		var	container = $('.container'),//整个游戏界面的容器
				gameArea = container.children('.gameArea'),//游戏操作区域
				wNum = attr.wNum,
				hNum = attr.hNum,
				mines = attr.mineNum,
				gameAreaWidth = wNum*squareSize,
				gameAreaHeight = hNum*squareSize,
				eleStr = '';
		
		//对一些变量进行初始化赋值
		nowLevel = attr;							//保存当前的难度等级参数
		currentMineNum = mines;				//当前剩余的雷数目
		surplusSquareNum = wNum*hNum;	//当前剩余未翻开的方块的数目
		
		$('.time-num').text('00 : 00');
		$('.mine-num').text(mines+'');
		
		//将游戏容器移动到可视区域中间
		container.css({
			'left' : ($(window).width() - gameAreaWidth - 40)/2+ 'px',
			'top' : ($(window).height() - gameAreaHeight - 120)/2+ 'px',
			'width' : gameAreaWidth + 40 +'px',
			'height' : gameAreaHeight + 120 +'px'
		});
		//游戏区域大小
		gameArea.css({
			'width' : gameAreaWidth +'px',
			'height' : gameAreaHeight +'px'
		});
		
		//添加 wNum*hNum 个方块
		for (let i = 0,n = wNum*hNum; i < n; i++) {
			eleStr += '<div class="square"><span></span><span class="greyStyle"></span></div>';
		}
		//添加到游戏区域
		gameArea.append(eleStr);
		
		//给每个方块添加属性,将全部方块放进二维数组
		for (let i = 0,n = 0,tempArr = gameArea.find('.square'); i < hNum; i++) {
			squareArr[i] = [];
			for (let j = 0; j < wNum; j++) {
				tempArr.eq(n).prop({
					'row' : i,		//方块所在行
					'col': j,			//方块所在列
					'state' : 0 , //方块的状态位 -1:已翻开，不可点击 ，0:未翻开，可点击，1：已标记红旗，2：已标记问号
					'aroundMines' : 0 ,//此方块周围的雷的数目
					'isMine' : false , //此方块是否是地雷
					'isMarked' : false //此方块是否被标记
				});
				squareArr[i][j] = tempArr.eq(n++);//存放方块
			}
		}
	}
	
	//随机安放雷的位置，鼠标第一次点击时调用此函数
	function randomMinePosition(minesPosSet,attr,target)
	{
		var mines = attr.mineNum,
				rows = attr.hNum,
				cols = attr.wNum,
				clickR = target.prop('row'),//鼠标点击的那个位置
				clickC = target.prop('col');
				
		for (let i = 0; i < mines; )
		{
			let r = Math.floor(Math.random()*rows),
			    c = Math.floor(Math.random()*cols),
					str = r+'-'+c;
			//鼠标第一次点击时的位置周围八个方块不能出现雷，避免第一次就点到雷死掉了
			if((r>=clickR-1&&r<=clickR+1) && (c>=clickC-1&&c<=clickC+1)) {
				continue;
			}
			// 在 minesPosSet 中不能存在，也就是雷的位置不能重复出现在同一个地方
			if(minesPosSet[str] === undefined) {
				minesPosSet[str] = {
					'row' : r,
					'col' : c
				};
				i++;
			}
		}
		//调用计算每个方块周围的雷的数目函数
		getAroundMines(minesPosSet);
	}
	
	//获取方块周围雷的数目
	function getAroundMines(minesPosSet)
	{
		//遍历雷的位置集合，根据雷的位置集合反过来计算其周围不是雷的方块的周围雷数
		$.each(minesPosSet,function(index,value){
		  let r = value.row,
					c = value.col;
			//squareArr中第r行第c列的方块是地雷,为其添加地雷的背景图片
			squareArr[r][c].addClass('bg-mine').prop('isMine',true);
			
			for (let i = r-1; i <= r+1; i++) {
			 	for (let j = c-1; j <= c+1; j++) {
					//超出边界
			 	 	if(i<0 || j<0 || i>=nowLevel.hNum || j>=nowLevel.wNum){
						continue;
					}
					//循环到当前这个地雷 或者 当前循环到的也是一个地雷
					if(i===r && j===c || minesPosSet[i+'-'+j]!==undefined) {
						continue;
					}
					squareArr[i][j].prop('aroundMines',function(index,pro){
						return pro+1;
					});
			 	}
			}
		});
		//将上面标记好的周围雷的数目写到html中
		for (let i = 0,h = nowLevel.hNum; i < h; i++) {
		 	for (let j = 0,w = nowLevel.wNum; j < w; j++) {
				let square = squareArr[i][j],
						aroundMines = square.prop('aroundMines');
				//如果周围没有雷 或者 本身是雷 ，就跳过
				if(aroundMines===0 || square.prop('isMine')) {
					continue;
				}
				square
					.css('color',fontColor[aroundMines]+'')
					.children('span:first')
					.text(aroundMines+'');
			}
		}
	}
	
	//重新开始游戏
	function restart(attr)
	{
		//重置变量
		squareArr = [];
		minesPosSet = {};
		openedSet = {};
		gameBegin = true;
		
		//重置界面
		$('.gameArea').remove();//移除原来的游戏区域
		$('.container').append('<div class="gameArea"></div>');//重新添加游戏区域
		
		//重新启动函数
		addEvent(true);		//重新为游戏区域添加事件代理
		layoutBoard(attr);//重新布局游戏区域
		gameTiming(); 		//重新开始游戏计时
	}
	
	//游戏结束
	function gameOver(isWin)
	{
		clearInterval(timer);
		let mask = $('<div class="gameOver-mask"></div>');
		mask.css({
				'width' : nowLevel.wNum*squareSize + 'px',
				'height' : nowLevel.hNum*squareSize + 'px',
				'lineHeight' : nowLevel.hNum*squareSize + 'px'
			});
			
			if(isWin) { //找出全部炸弹，顺利过关
				mask.append('<span>用时：'+ $('.time-num').text() +'</span>');
			} else {    //踩到了炸弹，死掉了
				mask.append('<span>踩到炸弹了</span>');
			}
			
		$('.gameArea').append(mask);
		
		//所有雷的位置上的span消失
		$.each(minesPosSet,function (index,value) {
			squareArr[value.row][value.col]
				.children(':last')
				.slideUp(500,function(){
					$(this).remove();
				});
		});
	}
	
	//是否过关
	function checkPass(byFlagMark)
	{
		let isPass = true;//
		//通过标记小红旗的方式判断是否过关
		if(byFlagMark)
		{
			$.each(minesPosSet,function (index,value) {
				//如果雷位置所对应的方块没有被标记小红旗
				if( ! squareArr[value.row][value.col].prop('isMarked')) {
					isPass = false;
					return false;
				}
			});
			if(isPass) {
				gameOver(true);
			}
		} 
		else //通过剩余的方块数判断是否过关，剩余的方块数等于雷数目即代表过关
		{
			if(surplusSquareNum === nowLevel.mineNum) {
				gameOver(true);
			}
		}
	}
	
	//扩散空白的方块
	function spreadBlankSquare(target,spaceSet)
	{
		let	r = target.prop('row'),
				c = target.prop('col');
		
		target.prop('state',-1);		//状态位置为 -1 ，不可点击
		spaceSet = spaceSet || {};	//装有空白格子的集合
		surplusSquareNum--;					//当前剩余的未翻开的方块减一
		openedSet[r+'-'+c] = 1;			//将方块添加到已翻开集合
		spaceSet[r+'-'+c] = {'row' : r,'col' : c};
		
		
		for (let i = r-1; i <= r+1; i++) {
		 	for (let j = c-1; j <= c+1; j++) {
				//超出边界
				if(i<0 || j<0 || i>=nowLevel.hNum || j>=nowLevel.wNum){
					continue;
				}
				//循环到当前这个空白格子 或者 当前循环到的已经加入了spaceSet
				if(i===r && j===c || spaceSet[i+'-'+j]!==undefined) {
					continue;
				}
				//squareArr[i][j]背景是数字
				if(squareArr[i][j].prop('aroundMines') > 0) {
					//翻开方块上的遮罩span
					squareArr[i][j].children(':last').fadeOut(200); 
					squareArr[i][j].prop('state',-1);		//状态位置为 -1 ，不可点击
					//第一次被翻开
					if(openedSet[i+'-'+j]===undefined){
						openedSet[i+'-'+j] = 1;
						surplusSquareNum--;	//当前剩余的未翻开的方块减一
					}
				} 
				else if(squareArr[i][j].prop('aroundMines') === 0) {
				//如果squareArr[i][j]也是空白格，递归继续查找空白格子
					//覆盖在方块上的span消失
					squareArr[i][j].children(':last').fadeOut(200); 
					//递归
					spreadBlankSquare(squareArr[i][j],spaceSet);
				}
			}
		}
	}
	
	//使用鼠标操作游戏
	function play(e)
	{
		//获取事件源并包装为jQuery对象，注意：target是square里面的span
		var target = e.srcElement ? $(e.srcElement) : $(e.target);
		//如果点击了已经翻开的方块，直接返回, 或者点击到方块上的数字，直接返回
		if(target.prop('class')==='square' || !target.prop('class')) {
			return;
		}
		//如果事件源是装有小红旗的 i 标签，就将target定位为其父元素span
		target = target.prop('class')==='mark-flag' ? target.parent() : target; 
		
		var uber = target.parent(),			//取到div.square,是jQuery对象
				state = uber.prop('state'),	//.square方块的状态位
				mouseKey = e.which; 				//鼠标按键 1：左键 2：中键 3:右键
		//state: -1 | 0 | 1 | 2 ,依次代表：已翻开 | 原始未翻开 | 标记旗子 | 标记问号
		
		//鼠标左键可以点击的情况
		if(mouseKey===1 && (state===0 || state===2)) 
		{
			uber.prop('state',-1);//状态位置为 -1 ，不可点击
			target.fadeOut(300); 	//覆盖在方块上的span消失
			surplusSquareNum--;		//当前剩余的未翻开的方块减一
			openedSet[uber.prop('row')+'-'+uber.prop('col')] = 1;//将方块添加到已翻开集合
			
			//每次开始新游戏，鼠标第一次点击时进行 安放雷的位置，点击的位置周围八个方块不能出现雷
			if(gameBegin) {
				gameBegin = false;
				// 调用随机安放雷的位置函数
				randomMinePosition(minesPosSet,nowLevel,uber);
			}
			//点击到了炸弹，游戏结束
			if(uber.prop('isMine')) {
				//在被点击的那个雷上加一个红色的遮罩
				uber.prepend($('<span class="click-mine-mask"></span>'));
				//游戏结束
				gameOver(false);
				return false;
			}
			//如果当前点击的方块的周围雷数为0，就检查是否可以扩散
			if(uber.prop('aroundMines') === 0) {
				//上面的已经减一，这里加一恢复原样，因为每调用一次spreadBlankSquare函数中也会使其减一
				surplusSquareNum++;		
				//调用扩散空白方块的函数
				spreadBlankSquare(uber);
			}
			
			//调用检查是否过关的函数
			checkPass(false);
		} 
		else if(mouseKey===3 && state!==-1) //右键可以点击的情况
		{ 
			switch (state){
				case 0:
					//标记小红旗
					target.append('<i class="mark-flag"></i>');
					//被标记置为true
					uber.prop('isMarked',true);
					//剩余雷数目减一
					$('.mine-num').text(--currentMineNum + '');
					//如果标记了雷数目个方块，就判断是否过关
					if(currentMineNum === 0) {
						checkPass(true);
					}
					break;
				case 1:
					//标记问号，取消标记小红旗
					target.text('?');
					//取消被标记
					uber.prop('isMarked',false);
					//剩余雷数目加一
					$('.mine-num').text(++currentMineNum + '');
					//如果标记了雷数目个方块，就判断是否过关
					if(currentMineNum === 0) {
						checkPass(true);
					}
					break;
				case 2:
					target.text('');
					break;
				default: break;
			}
			//将方块的状态位state加一循环
			uber.prop('state',(state+1)%3);
		}
		
	}
	
	//添加事件的函数：为游戏界面的方块、选项卡选项添加事件
  function addEvent(restartFlag) 
	{
		//给游戏区域的方块添加事件代理
		$('.gameArea').delegate('div','mousedown',function(e){
			e = e || window.event;
			play(e);
			return false;
		});
		//禁用游戏区域的右键菜单
		$(".gameArea").bind("contextmenu",function(event){
     var e = $.event.fix(event);
      e.preventDefault();
			return false;
		});
		//如果是重新开始游戏的话，只需要给gameArea以及里面的div添加事件就可以了
		if(restartFlag) {
			return;
		}
		//重新开始游戏
		$('.smile').on('click',function(){
			restart(nowLevel);
		});
    //选项按钮
    $('.option').on('click',function(){
			//选项卡展开和收起
      $(this).find('.sub-option').slideToggle(300);
    });
    //初级，中级，高级难度点击 
    $('.item:lt(3)').on('click',function(){
      $(this).siblings().removeClass('item-click-bg');
      $(this).addClass('item-click-bg');//选中添加背景颜色
			//调用棋盘布局函数
			restart(difficult[$(this).index()]);
			$(this).parent().slideToggle(300);//选项卡收起
      return false;//阻止冒泡到option按钮上
    });
    //自定义按钮与界面设置按钮
    $('.item:gt(2)').on('click',function(){
			//自定义按钮
			if($(this).index() === 3) { 
				$(this).children('.userDefined').toggleClass('userDefined-show');
				$(this).siblings().children('.themeSettings').removeClass('themeSettings-show');
			} 
			else { //界面设置按钮
				$(this).children('.themeSettings').toggleClass('themeSettings-show');
				$(this).siblings().children('.userDefined').removeClass('userDefined-show');
			}
      return false;//阻止冒泡到option按钮上
    });
		//界面设置下面的两个主题添加点击事件
		$('.greyTheme span:last').on('click',function(){
			$('.square').find('span:last').attr('class','greyStyle');
		});
		$('.blueTheme span:last').on('click',function(){
			$('.square').find('span:last').attr('class','blueStyle');
		});
		//自定义面板下的内容被点击阻止冒泡
		$('.userDefined').on('click','li',function(){
			return false; //自定义面板中的内容阻止冒泡
		});
		//自定义面板下的输入框获得焦点时
		$('.userDefinded-input').focus(function(){
			var value = $(this).val();
			if(value == '请输入值 ' || value == '不符合 '){
				$(this).css('color','black').val('');
			}
		});
		//自定义面板下的输入框失去焦点时
		$('.userDefinded-input').blur(function(){
			var	value = $(this).val(),
					max = parseInt($(this).attr('max')),
					reg = /\D+/gi;
			if(value == '') {
				$(this).css('color','crimson').val('请输入值 ');
			} else if(reg.test(value)) {
				$(this).css('color','crimson').val('不符合 ');
			} else {
				value = parseInt(value);
				switch (max)
				{
					case 24: value = value<9 ? 9 : (value>24 ? 24 : value);
						break;
					case 30: value = value<9 ? 9 : (value>30 ? 30 : value);
						break;
					case 668: 
						var inputs = $('.userDefinded-input'),
								hNum = parseInt(inputs.eq(0).val()),//高度
								wNum = parseInt(inputs.eq(1).val()),//宽度
								maxMineNum = 0;//自定义雷的数目
						//自定义宽和高必须有意义，否则取默认值		
						if(isNaN(hNum)) {
							inputs.eq(0).val('9');
							hNum = 9;
						}
						if(isNaN(wNum)) {
							inputs.eq(1).val('9');
							wNum = 9;
						}
						//自定义雷的数目是有限制的，通常情况下最大值为：宽和高的乘积减去宽和高的和+2
						maxMineNum = hNum*wNum-hNum-wNum+2;
						//最后确定自定义雷的数目
						value = value<10 ? 10 : (value>maxMineNum ? maxMineNum : value);
						break;
					default:
						break;
				}
				$(this).css('color','black').val(value+'');
			}
			
		});
		//自定义面板下的确认按钮
		$('.userDefinded-ensure').on('click',function(){
			var inputs = $('.userDefinded-input'),
					hNum = parseInt(inputs.eq(0).val()),
					wNum = parseInt(inputs.eq(1).val()),
					mineNum = parseInt(inputs.eq(2).val()),
					//自定义宽和高必须有意义，否则取默认值
					hNumHandle = isNaN(hNum) ? 9 : hNum,
					wNumHandle = isNaN(wNum) ? 9 : wNum,
					mineNumHandle = isNaN(mineNum) ? 10 : mineNum,
					//自定义雷的数目是有限制的，普通情况下最大值为：宽和高的乘积减去宽和高的和+2
					maxMineNum = hNumHandle * wNumHandle - hNumHandle - wNumHandle + 2,
					//用于接收自定义难度参数,存在默认值：9,9,10
			    userDefinedDiff = {}; 
					
			//雷数目的最小值与最大值有限制		
			mineNumHandle = mineNumHandle<10 ? 10 : (mineNumHandle>maxMineNum ? maxMineNum : mineNumHandle);
			//自定义难度
			userDefinedDiff.hNum = hNumHandle;
			userDefinedDiff.wNum = wNumHandle;
			userDefinedDiff.mineNum = mineNumHandle;
			//自定义面板关闭
			$('.userDefined').toggleClass('userDefined-show');
			$('.item:lt(3)').removeClass('item-click-bg');//取消已选难度的背景
			$('.sub-option').slideUp(500);//选项卡收起
			//调用棋盘布局函数
			restart(userDefinedDiff);
		});
		//自定义面板下的取消按钮
		$('.userDefinded-cancle').on('click',function(){
			$('.userDefined')
				.toggleClass('userDefined-show')
				.find('.userDefinded-input')
				.val('');
		});
		
  }
  
	//游戏计时函数
	function gameTiming()
	{
		var second = 0, 	//计时 秒
				minute = 0, 	//计时 分
				timeStr = ''; //分与秒组合起来的字符串
		
		clearInterval(timer);
		timer = setInterval(function(){
			second ++;
			if(second === 60) {
				second = 0;
				minute ++; 
			}
			timeStr = (minute<10?'0'+minute:minute+'') +' : '+ (second<10?'0'+second:second+'');
			$('.time-num').text(timeStr);
		},1000);
	}
	
	//初始化函数
  function init() 
	{
		layoutBoard(difficult[0]); //初始化为 9 x 9网格 10个雷
    addEvent(); 							 //添加事件
		gameTiming(); 						 //游戏计时开始
  }
  
  init();
  
}(jQuery,window));