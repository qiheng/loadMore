/*!
 * 加载更多构造函数
 */

(function($, win, doc, undefined){
	var $win = $(win),
		$doc = $(doc);
	
	// 加载下方数据方法
	function fnLoadDown(oLoadMore){
		var self = oLoadMore,
			opts = self.opts;
			
		self.$domDown.html(opts.domDown.domLoad);
		self.loading = true;
		
		opts.loadDownFn(self);
		
	}
	
	/**
	* 加载更多封装函数
	* @para { Object } 处理元素
	* @para { Object } 加载更多的参数设置
	*
	*/
	function LoadMore(el, options) {
		var self = this, _default;
		
		if (!(this instanceof LoadMore)) {
			return new LoadMore(el, options);
		}
		//console.log(self);
		self.$element   = $(el);
		self.hasData    = true;	  // 是否有数据	
		self.loading    = false;   // loading状态
		self._scrollTop =  0
		
		var _default = {
			scrollArea   : $(el)
			, eventType    : 'scroll'
			, threshold    : ''       // 提前加载距离
			, domDown      : {		  // 下拉提示DOM
                domClass   : 'load-panel',
                domRefresh : '<div class="load-refresh">上拉加载更多...</div>',
                domLoad    : '<div class="load-loading"><i class="loading"></i>加载中...</div>',
                domNoData  : '<div class="load-no-data">暂无更多数据</div>'
            }
			, loadDownFn   : ''         // 下拉执行的函数
		};
		
		self.opts = $.extend(true, {}, _default, options);

		if (!$(self.$element).length) {
			throw('This scrollElement is Not found');
		}
		
		self._init();
		
	}
	
	LoadMore.prototype._init = function () {
		var self = this,
			opts = self.opts;
			
		// 初始化加载提示元素
		if (opts.loadDownFn !== '') {
			self.$element.append('<div class="' + opts.domDown.domClass + '">' + opts.domDown.domRefresh + '</div>')
			self.$domDown = $('.' + opts.domDown.domClass);
		}
		
		// 初始化文档与视窗高度
		if (opts.scrollArea === win) {
			self.$scrollArea = $win;
			// 获取文档高度
			self._scrollContentHeight = $doc.height();
			// 获取视窗高度
			self._scrollViewHeight    = win.innerHeight || doc.documentElement.clientHeight;
		} else {
			self.$scrollArea = opts.scrollArea;
			self._scrollContentHeight = self.$scrollArea[0].scrollHeight();
			self._scrollViewHeight    = self.$scrollArea.height();
		}

		// 文档高度小于视窗高度，获取一次数据
		if (self._scrollContentHeight <= self._scrollViewHeight) {
			// 执行一次加载函数
			if (opts.loadDownFn !== '') {
				fnLoadDown(self);
			}
		}
		
		// 事件初始化
		self.eventAction();
		
	}
	
	// 事件绑定
	LoadMore.prototype.eventAction = function () {
		var self      = this,
			opts      = self.opts,
			_loadType = opts.eventType;
	
		// 监听视窗变化
		$win.on('resize.loadMore', function () {
			if(self.opts.scrollArea === win){
                // 重新获取win显示区高度
                self._scrollViewHeight = win.innerHeight;
            }else{
                self._scrollViewHeight = self.$scrollArea.height();
            }
		})
		
		// 点击拉取数据
		function clickAction() {
			self.$domDown.on('click.loadMore', function (e) {
				e.preventDefault();
				
				if(opts.loadDownFn != '' && !self.loading && self.hasData) {
					fnLoadDown(self);
				}
				
				e.stopPropagation();
			})
		}
		
		// 滚动拉取数据
		function scrollAction() {
			// 滚动加载下方
			self.$scrollArea.on('scroll.loadMore',function(){
				self._scrollTop = self.$scrollArea.scrollTop();
				
				if(opts.threshold === ''){
					// 默认滑到加载区2/3处时加载
					self._threshold = Math.floor(self.$domDown.height() * 1 / 3);
				}else{
					self._threshold = opts.threshold;
				}
                //self.$domDown.html((self._scrollContentHeight - self._threshold) +'----'+ (self._scrollViewHeight + self._scrollTop))
				if(opts.loadDownFn != '' && !self.loading && self.hasData &&  (self._scrollContentHeight - self._threshold) <= (self._scrollViewHeight + self._scrollTop)){
					fnLoadDown(self);
				}
			});
		}

		switch (_loadType) {
			case 'click':
				clickAction();
				break;
			case 'scroll':
				scrollAction();
				break;
		}
		
	};
	
	// 刷新视图高度与加载状态
	LoadMore.prototype.refresh = function () {
		var self = this;
		self.loading = false;
		
		if (!!self.hasData) {
			// 加载区修改样式
			self.$domDown.html(self.opts.domDown.domRefresh);
			fnRecoverContentHeight(self);
		} else {
			self.$domDown.html(self.opts.domDown.domNoData);
		}

	}
	
	// 更新加载更多组件
	LoadMore.prototype.update = function () {
		var self = this;
		self.loading = false;
		self.hasData = true;
		
		// 加载区修改样式
		self.$domDown.html(self.opts.domDown.domRefresh);
		
		fnRecoverContentHeight(self);
		// 文档高度小于视窗高度

		if (self._scrollContentHeight <= self._scrollViewHeight) {
			self.$domDown.hide();
		} else {
			self.$domDown.show();
		}
	}
	
	// 加载完毕无数据
	LoadMore.prototype.noData = function () {
		this.hasData = false;
	}
	
	// 重新获取文档高度
    function fnRecoverContentHeight(oLoadMore){
        if(oLoadMore.opts.scrollArea === win){
            oLoadMore._scrollContentHeight = $doc.height();
        }else{
            oLoadMore._scrollContentHeight = oLoadMore.$element[0].scrollHeight;
        }
    }
	
	$.fn.loadMore = function (opts) {
		return this.each(function (i,el) {
			$(el).data('load-more', new LoadMore(this, opts));
		})
		
	}
		
	win.LoadMore = LoadMore;
	
})(window.Zepto || window.jQuery, this, document);