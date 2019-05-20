import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import login from '@/components/login'
import menu from '@/components/menu'
import top from '@/components/top'
import breadcrumb from '@/components/breadcrumb'
import lecturerList from '@/pages/lecturer/lecturerList'
import memberList from '@/pages/member/memberList'
import authList from '@/pages/member/authList'
import bankCard from '@/pages/member/bankCard'
import mLevelChange from '@/pages/member/levelChange'
import upgradeRecord from '@/pages/member/upgradeRecord'
import relationshipChange from '@/pages/member/relationshipChange'
import svip from '@/pages/member/svip'
import relation from '@/pages/member/relation'
import mClassification from '@/pages/meeting/meetingClassification'
import meetingList from '@/pages/meeting/meetingList'
import shareList from '@/pages/meeting/shareList'
import commentList from '@/pages/meeting/commentList'
import signUp from '@/pages/meeting/signUp'
import addMeeting from '@/pages/meeting/addMeeting'
import editMeeting from '@/pages/meeting/editMeeting'
import UEditor from '@/components/UE'
import Agent from '@/pages/agent/agentList'
import levelChange from '@/pages/agent/levelChange'
import sponsorList from '@/pages/sponsor/sponsorList'
import sponsorFans from '@/pages/sponsor/sponsorFans'
import businessCard from '@/pages/card/businessCard'
import businessCardDetails from '@/pages/card/businessCardDetails'
import productList from '@/pages/product/productList'
import productDetails from '@/pages/product/productDetails'
import productCategory from '@/pages/product/productCategory'
import cardCategory from '@/pages/card/cardCategory'
import systemMessage from '@/pages/message/SystemMessage'
import pushMessage from '@/pages/message/pushMessage'
import idxPic from '@/pages/picture/idxPic'
import ziKuPic from '@/pages/picture/ziKuPic'
import sharePic from '@/pages/picture/sharePic'
import articleSlider from '@/pages/picture/articleSlider'
import operationProcess from '@/pages/picture/operationProcess'
import ctrlVideo from '@/pages/picture/ctrlVideo'
import activationCodeList from '@/pages/activationCode/activationCodeList'
import activationCodeDetail from '@/pages/activationCode/activationCodeDetail'
import transferActivationCode from '@/pages/activationCode/transferActivationCode'
import activationCodeUse from '@/pages/activationCode/activationCodeUse'
import codeDetail from '@/pages/activationCode/codeDetail'
import roleList from '@/pages/system/roleList'
import roleListDetails from '@/pages/system/roleListDetails'
import adminList from '@/pages/system/adminList'
import basicSetting from '@/pages/system/basicSetting'
import menuList from '@/pages/system/menuList'
import greetList from '@/pages/system/greetList'
import memberBalance from '@/pages/finance/memberBalance'
import memberProfit from '@/pages/finance/memberProfit'
import record from '@/pages/finance/record'
import revenueStream from '@/pages/finance/revenueStream'
import memberCenterPic from '@/pages/picture/memberCenterPic'
import onlineOrder from '@/pages/order/onlineOrder'
import underLineOrder from '@/pages/order/underLineOrder'
import selectMeeting1 from '@/pages/order/selectMeeting1'
import articleList from '@/pages/article/articleList'
import editArticle from '@/pages/article/editArticle'
import articleType from '@/pages/article/articleType'
import userArticleList from '@/pages/article/userArticleList'
import editUserArticle from '@/pages/article/editUserArticle'
import home from '@/pages/home'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'login',
      component: login,
      hidden: true
    },
    {
      path: '/menu',
      name: 'menu',
      component: menu,
      hidden: true
    },
    {
      path: '/top',
      name: 'top',
      component: top,
      hidden: true
    },
    {
      path: '/breadcrumb',
      name: 'breadcrumb',
      component: breadcrumb,
      hidden: true
    },
    {
      path: '/UEditor',
      name: 'UEditor',
      component: UEditor,
      hidden: true
    },
    {
      path: "/",
      name: '会员管理',
      component: home,
      icon: 'el-icon-message',
      children: [
        {path: 'memberList', component: memberList, name: '会员列表'},
        //{path: 'authList', component: authList, name: '认证列表'},
        {path: 'bankCard', component: bankCard, name: '银行卡管理'},
        {path: 'upgradeRecord', component: upgradeRecord, name: '会员升级记录'},
        {path: 'relation', component: relation, name: '推荐关系'},
        {path: 'relationshipChange', component: relationshipChange, name: '关系变更'},
        {path: 'mLevelChange', component: mLevelChange, name: '级别变更'},
        {path: 'svip', component: svip, name: '会员会议权限', hidden: true},
      ]
    },
    {
      path: "/",
      name: '代理商管理',
      component: home,
      icon: 'el-icon-sold-out',
      children: [
        {path: 'agent', component: Agent, name: '代理商列表'},
        {path: 'levelChange', component: levelChange, name: '级别变更'}
      ]
    },
    {
      path: "/",
      name: '激活码管理',
      component: home,
      icon: 'el-icon-printer',
      children: [
        {path: 'activationCodeList', component: activationCodeList, name: '激活码列表'},
        {path: 'activationCodeDetail', component: activationCodeDetail, name: '激活码明细', hidden: true},
        {path: 'transferActivationCode', component: transferActivationCode, name: '激活码转赠明细'},
        {path: 'codeDetail', component: codeDetail, name: '提取激活码详情', hidden: true},
        {path: 'activationCodeUse', component: activationCodeUse, name: '激活码使用明细'}
      ]
    },
    {
      path: "/",
      name: '讲师管理',
      component: home,
      icon: 'el-icon-service',
      children: [
        {path: 'lecturerList', component: lecturerList, name: '讲师列表'}
      ]
    },
    {
      path: "/",
      name: '主办方管理',
      component: home,
      icon: 'el-icon-view',
      children: [
        {path: 'sponsorList', component: sponsorList, name: '主办方列表'},
        {path: 'sponsorFans', component: sponsorFans, name: '旗下会员', hidden: true}
      ]
    },
    {
      path: "/",
      name: '资库名片管理',
      component: home,
      icon: 'el-icon-tickets',
      children: [
        {path: 'businessCard', component: businessCard, name: '名片列表'},
        {path: 'cardCategory', component: cardCategory, name: '资库名片分类'},
        {path: 'businessCardDetails', component: businessCardDetails, name: '名片详情', hidden: true}
      ]
    },
    {
      path: "/",
      name: '产品管理',
      component: home,
      icon: 'el-icon-goods',
      children: [
        {path: 'productList', component: productList, name: '产品列表'},
        {path: 'productDetails', component: productDetails, name: '产品详情', hidden: true},
        {path: 'productCategory', component: productCategory, name: '产品分类'}
      ]
    },
    {
      path: "/",
      name: '文章管理',
      component: home,
      icon: 'el-icon-news',
      children: [
        {path: 'articleList', component: articleList, name: '文章列表'},
        {path: 'articleType', component: articleType, name: '文章分类'},
        {path: 'editArticle', component: editArticle, name: '编辑文章', hidden: true},
        {path: 'userArticleList', component: userArticleList, name: '用户文章列表'},
        {path: 'editUserArticle', component: editUserArticle, name: '编辑用户文章', hidden: true},
      ]
    },
    {
      path: "/",
      name: '会议管理',
      component: home,
      icon: 'el-icon-date',
      children: [
        {path: 'mClassification', component: mClassification, name: '会议分类'},
        {path: 'meetingList', component: meetingList, name: '会议列表'},
        {path: 'editMeeting', component: editMeeting, name: '编辑会议', hidden: true},
        {path: 'addMeeting', component: addMeeting, name: '添加会议', hidden: true},
        {path: 'commentList', component: commentList, name: '评论列表', hidden: true},
        {path: 'shareList', component: shareList, name: '分享列表', hidden: true},
        {path: 'signUp', component: signUp, name: '报名管理', hidden: true}
      ]
    },
    {
      path: "/",
      name: '订单管理',
      component: home,
      icon: 'el-icon-document',
      children: [
        {path: 'onlineOrder', component: onlineOrder, name: '线上订单'},
        {path: 'underLineOrder', component: underLineOrder, name: '线下订单'}
      ]
    },
    {
      path: "/",
      name: '财务管理',
      component: home,
      icon: 'el-icon-rank',
      children: [
        {path: 'memberBalance', component: memberBalance, name: '会员余额', hidden: true},
        {path: 'memberProfit', component: memberProfit, name: '会员余额'},
        {path: 'record', component: record, name: '提现记录'},
        {path: 'revenueStream', component: revenueStream, name: '收益流水'}
      ]
    },
    {
      path: "/",
      name: '消息管理',
      component: home,
      icon: 'el-icon-bell',
      children: [
        {path: 'systemMessage', component: systemMessage, name: '系统消息'},
        {path: 'pushMessage', component: pushMessage, name: '推送消息', hidden: true}
      ]
    },
    {
      path: "/",
      name: '图片管理',
      component: home,
      icon: 'el-icon-picture',
      children: [
        {path: 'idxPic', component: idxPic, name: '首页轮播管理'},
        {path: 'ziKuPic', component: ziKuPic, name: '资库轮播管理'},
        {path: 'articleSlider', component: articleSlider, name: '文章轮播管理'},
        {path: 'operationProcess', component: operationProcess, name: '操作手册管理'},
        {path: 'ctrlVideo', component: ctrlVideo, name: '操作视频管理'},
        {path: 'sharePic', component: sharePic, name: '分享图片管理', hidden: true},
        {path: 'memberCenterPic', component: memberCenterPic, name: '会员中心图片管理', hidden: true}
      ]
    },
    {
      path: "/",
      name: '系统设置',
      component: home,
      icon: 'el-icon-setting',
      children: [
        {path: 'basicSetting', component: basicSetting, name: '基础设置'},
        {path: 'adminList', component: adminList, name: '管理员列表'},
        {path: 'roleList', component: roleList, name: '角色列表'},
        {path: 'menuList', component: menuList, name: '菜单管理'},
        {path: 'greetList', component: greetList, name: '打招呼管理'},
        {path: 'roleListDetails', component: roleListDetails, name: '角色权限', hidden: true}
      ]
    }
  ]
})
