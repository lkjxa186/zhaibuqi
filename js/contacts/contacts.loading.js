/**
 * Created with JetBrains WebStorm.
 * User: willkan
 * Date: 13-3-30
 * Time: 下午6:51
 * To change this template use File | Settings | File Templates.
 */
define(function(require, exports, module){
    var GROUP_ALL = -1;
    var queueAjax = require('queueAjax'),
        r_contacts = (location.pathname.indexOf('r-contacts') !== -1),
        url = !r_contacts ?
            'json/attention_list.php'+location.search : 'json/fan_list.php'+location.search,
        $tips,
        $clearLeft = $('<div></div>').css('clear','left'),
        $groupName,
        page = 1,
        group = GROUP_ALL,
        end = false;//表示好友是否加载完毕
    module.exports = {
        currentPage: function(){return page;},
        resetPage: resetPage,
        loadingAjax: loadingAjax
    };
    /* reset page to 1 */
    function resetPage(selectGroup){
        page = 0;
        end = false;
        group = typeof selectGroup === 'number' ? selectGroup : GROUP_ALL;
    }
    /*
    * @param setting {num} 1:firstAjax,-1:lastAjax;other:Ajax
    * @param namespace {string} ajaxQueue name
    * @param update {boolean}
    * */
    function loadingAjax(setting, namespace, update, groupName){
        if(typeof update === 'number'){
            $groupName.text(groupName);
            $('.user-display').remove();
            resetPage(update);
        }
        if(!end){
            $tips.text('正在加载...').show();
            queueAjax({
                type:"GET",
                dataType:"JSON",
                url: url,
                data:r_contacts ? { "page":page } : {
                    "page":page,
                    "group":group
                },
                success:appendPerson,
                error:function(){
                    $tips.text('加载失败请点击重试').show();
                }
            }, setting, namespace);
        } else{
            $tips.text('所有好友加载完毕').css('cursor','default').show();
        }
    }
    /*
    * @param data{portrait,href,name,institude,group}
    * */
    function appendPerson(data){
        if(data.groupNum){
            $groupName.append('(<span>' + data.groupNum + '</span>个)');
        }
        page++;
        if(data.person){
            $.each(data.person, function(){
                var portrait = this.portrait,
                    href = this.href,
                    name = this.name,
                    academy = this.academy,
                    group = "组别:"+this.group,
                    af_id = this.af_id,
                    ag_id = this.ag_id,
                    id = this.id,
                    status = this.status,
                    $img = $("<img />").attr({
                        "src":portrait,
                        "alt":name
                    }),
                    $name = $('<p></p>').append($('<a></a>').addClass('name').attr({
                            href:href,
                            value: id
                        }).text(name)),
                    $status = $('<p/>').addClass('status').attr('value',status).text(statusToStr(parseInt(status, 10))),
                    $academy = $('<p></p>').text(academy),
                    $portrait = $("<a></a>").addClass("pic").attr("href",href),
                    $userInfo = $("<div></div>").addClass("user-info"),
                    $group = $("<p></p>").attr('value',ag_id).addClass("extra").text(group),
                    $userDisplay = $("<div></div>").attr('value',af_id).addClass("user-display");
                $userInfo.append($name, $status, $academy);
                $userDisplay.append($portrait.append($img),
                    $userInfo,$clearLeft.clone());
                if($('.move').length !== 0){
                    $userDisplay.append($group);
                }
                $userDisplay.insertBefore($tips);
                $userDisplay.fadeIn(100);
            });
        }
        end = (data.end === 'end');
        if(end){
            $tips.text('所有好友加载完毕').css('cursor','default').show();
        }


        function statusToStr(status){
            var str = '';
            switch (status){
                case 1:
                    str = '已关注';
                    break;
                case 2:
                    str = '互相关注';
                    break;
            }
            return str;
        }
    }

    /*初始化页面*/
    $(function(){
        $groupName = $('.group-name');
        $tips = $('.clear');
    });
});
