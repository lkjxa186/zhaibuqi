<?php
//关注的人
require_once("../php/start-session.php");
require_once("../php/util.php");

header('Content-type: text/json');
header('Content-type: application/json');

$personal_id = $_GET['id'];
$page = $_GET['page'];

$user_id = $_SESSION['user_id'];
if(isset($_SESSION['user_id'])){
    $user_id = $_SESSION['user_id'];
}else{
    $user_id = USER_NO_LOGIN;
}

$page *= 12;
$dbc = mysqli_connect(host,user,password,database);

//查询关注的人
$query = "select af.attention_id id_1,u1.nickname name_1,p1.icon icon_1,u1.academy academy_1,
                      af.fan_id id_2,u2.nickname name_2,p2.icon icon_2,u2.academy academy_2,g.name group_name,af.status status
                from portrait p1
                right join user u1 on u1.user_id = p1.user_id
                right join attention_fan af on af.attention_id = u1.user_id
                left join user u2 on af.fan_id = u2.user_id
                left join portrait p2 on u2.user_id = p2.user_id
				left join attention_groups ag on ag.attention_fan_id = af.attention_fan_id
				left join groups g on ag.groups_id = g.groups_id
                where af.fan_id = $personal_id or (af.attention_id = $personal_id and af.status = 2) limit $page, 12";
$result = mysqli_query($dbc,$query);
$attention_lists = Array();
$attention_lists_count = 0;
if(!empty($result)){
    while($data = mysqli_fetch_array($result,MYSQLI_BOTH)){
        //用户关注列表
        if($data['id_1'] == $personal_id &&  $data['status'] == ATTENTION_EACH_OTHER)
            $attention_lists[$attention_lists_count] =array ('id'=>$data['id_2'],'name'=>$data['name_2'],'portrait'=>$data['icon_2'],'academy'=>$data['academy_2'],'group'=>$data['group_name']);
        else
            $attention_lists[$attention_lists_count] =array ('id'=>$data['id_1'],'name'=>$data['name_1'],'portrait'=>$data['icon_1'],'academy'=>$data['academy_1'],'group'=>$data['group_name']);
        $attention_lists_count++;
    }
}


//返回json
$echoStr ="";
echo "{";
echo "\"person\":[";
foreach($attention_lists as &$al){
    $echoStr .= "{\"portrait\":\"".UPLOAD_PORTRAIT_FRONT_TO_BACK.$al['portrait']."\",";
    $echoStr .= "\"href\":\"personal-page.php?id=".$al['id']."\",";
    $echoStr .= "\"name\":\"".$al['name']."\",";
    $echoStr .= "\"academy\":\"".$al['name']."\",";
    $echoStr .= "\"group\":\"".(isset($al['group'])?$al['group']:'未分组')."\"},";
}
$echoStr = substr($echoStr,0,strlen($echoStr)-1);//删除最后一个逗号
echo $echoStr;
echo "],";
echo "\"end\":\"".((count($attention_lists) < 9)?"end":"")."\"";
echo "}";
unset($al);
mysqli_close($dbc);
/*
 * {
    "person":[
        {
            "portrait":"images/search-head.jpg",
            "href":"a",
            "name":"name",
            "institude":"institude",
            "group":"group",
            "email":"email"
        },
        {
            "portrait":"images/search-head.jpg",
            "href":"a",
            "name":"name",
            "institude":"institude",
            "group":"group",
            "email":"email"
        },
        {
            "portrait":"images/search-head.jpg",
            "href":"a",
            "name":"name",
            "institude":"institude",
            "group":"group",
            "email":"email"
        },
        {
            "portrait":"images/search-head.jpg",
            "href":"a",
            "name":"name",
            "institude":"institude",
            "group":"group",
            "email":"email"
        }
    ],
    "end":"end"
}

 */
?>
