import Taro, { Component } from '@tarojs/taro'
import {Image, Text, View, Button} from '@tarojs/components'
import {PER_PAGE, LOADING_TEXT, REFRESH_STATUS} from "../../../constants/common";
import {AtAvatar, AtIcon, AtFloatLayout, AtInput, AtTextarea, AtMessage} from 'taro-ui'
import { NAVIGATE_TYPE } from '../../../constants/navigateType'
import { hasLogin } from '../../../utils/common'
import {connect} from "@tarojs/redux";

import './developerInfo.scss'


@connect(({ user,follow, chat }) => ({
  ...user,
  ...follow,
  ...chat
}))
class DeveloperInfo extends Component {

  config = {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#D64337',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      username: '',
      developerInfo: null,
      isFollowed: false,
      isShare: false,
      isOpen:false,
      commentName: '',
      commentBody: '',
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillMount() {
    let params = this.$router.params;
    this.setState({
      username: params.username,
      commentName: params.username,
      isShare: params.share
    })
  }

  componentDidMount() {
    Taro.startPullDownRefresh();
    this.getDeveloperInfo()
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onPullDownRefresh() {
    this.getDeveloperInfo()
  }

  getDeveloperInfo() {
    const { username } = this.state;
    this.props.dispatch({
      type: 'user/getUser',
      payload:{
        username: username
      },
      callback: (res) => {
        this.setState({
          developerInfo: res
        }, ()=>{
          if(hasLogin()){
            this.checkFollowing()
          }else{
            Taro.stopPullDownRefresh();
          }
        })
      }
    });
  }

  checkFollowing() {
    const { username } = this.state;
    this.props.dispatch({
      type: 'follow/checkFollowing',
      payload:{
        username: username
      },
      callback: (res) => {
        this.setState({
          isFollowed: res.isFollow
        });
        Taro.stopPullDownRefresh();
      }
    });
  }

  handleFollow() {
    if(hasLogin()){
      const { isFollowed, username } = this.state;
      if (isFollowed) {
        //取消关注
        this.props.dispatch({
          type: 'follow/unFollowed',
          payload:{
            username: username
          },
          callback: (res) => {
            console.log(res);
            this.setState({
              isFollowed: false
            });
          }
        });
      } else {
        //添加关注
        this.props.dispatch({
          type: 'follow/doFollowed',
          payload:{
            username: username
          },
          callback: (res) => {
            this.setState({
              isFollowed: true
            });
            Taro.stopPullDownRefresh();
          }
        });
      }
    }else{
      Taro.navigateTo({
        url: '/pages/login/login'
      })
    }
  }

  handleNavigate(type) {
    const { developerInfo } = this.state;
    switch (type) {
      case NAVIGATE_TYPE.REPOS: {
        Taro.navigateTo({
          url: '/pages/mine/repo/repoOtherList?username=' + developerInfo.login
        })
      }
        break
      case NAVIGATE_TYPE.FOLLOWERS: {
        Taro.navigateTo({
          url: '/pages/mine/follow/follower?type=followers&username=' + developerInfo.login
        })
      }
        break
      case NAVIGATE_TYPE.FOLLOWING: {
        Taro.navigateTo({
          url: '/pages/mine/follow/follower?type=following&username=' + developerInfo.login
        })
      }
        break
      case NAVIGATE_TYPE.STARRED_REPOS: {
        Taro.navigateTo({
          url: '/pages/mine/repo/repoStarOtherList?username=' + developerInfo.login
        })
      }
        break
      case NAVIGATE_TYPE.ISSUES: {
        Taro.navigateTo({
          url: '/RepoModule/pages/repo/issues?url=/user/issues'
        })
      }
        break
      default: {

      }
    }
  }
  onShareAppMessage(obj) {
    const { developerInfo } = this.state
    return {
      title: (developerInfo.name || developerInfo.login) + ' - GitHub',
      path: '/pages/account/developerInfo?username=' + developerInfo.login + '&share=true'
    }
  }

  onClickedHome () {
    Taro.reLaunch({
      url: '/pages/index/index'
    })
  }

  handleAddChatClick = () =>{
    this.setState({
      isOpen: true
    })
  }

  handleClose = (e) =>{
    this.setState({
      commentName: '',
      commentBody: '',
      isOpen: false
    })
  }

  handleChange =(value)=>{
    this.setState({
      commentName: value
    })
  };

  handleTextareaChange =(event)=>{
    this.setState({
      commentBody: event.target.value
    })
  };

  handleSubmit(){
    const {commentName, commentBody} = this.state;
    if(commentName == ''){
      Taro.showToast({
        title: '请输入接收者...',
        icon: 'none',
        mask: true,
      });
      return false;
    }
    if(commentBody == ''){
      Taro.showToast({
        title: '请输入私信内容...',
        icon: 'none',
        mask: true,
      });
      return false;
    }
    this.props.dispatch({
      type: 'chat/putChat',
      payload: {
        username: commentName,
        content: commentBody
      },
      callback: (res) => {
        if(res.id){
          Taro.atMessage({
            'message': '私信成功',
            'type': 'error',
          })
          this.setState({
            commentName: '',
            commentBody: '',
            isOpen: false
          })
        }
      }
    })
  }

  render() {
    const { developerInfo, isFollowed, isShare, isOpen } = this.state;
    if (!developerInfo) return <View />
    return (
      <View className='content'>
        <AtMessage />
        <Image className='account_bg' src={require('../../../asset/images/account_bg.png')}/>
        <View className='user_info'>
          <AtAvatar className='avatar' circle image={developerInfo.avatar_url}/>
          <Text className='username'>
            {developerInfo.name}
          </Text>
          <View className='login_name'>@{developerInfo.login}</View>
        </View>
        <View className='info_view'>
          {developerInfo.bio.length > 0 && <View className='bio'>{developerInfo.bio}</View>}
          <View className='item_view'>
            <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.REPOS)}>
              <View className='title'>{developerInfo.public_repos}</View>
              <View className='desc'>Repos</View>
            </View>
            <View className='line'/>
            <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.FOLLOWERS)}>
              <View className='title'>{developerInfo.followers}</View>
              <View className='desc'>Followers</View>
            </View>
            <View className='line'/>
            <View className='item' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.FOLLOWING)}>
              <View className='title'>{developerInfo.following}</View>
              <View className='desc'>Following</View>
            </View>
          </View>
          <View className='button_view'>
            {
              developerInfo.type === 'User' &&
              <Button className='button' onClick={this.handleFollow.bind(this)}>
                {isFollowed ? '取消关注' : '关注'}
              </Button>
            }
            <Button className='button' openType='share'>分享</Button>
          </View>
        </View>
        <View className='list_view'>
          <View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.STARRED_REPOS)}>
            <View className='list_title'>收藏的仓库</View>
            <AtIcon value='chevron-right' size='18' color='#7f7f7f'/>
          </View>
          {/*<View className='list' onClick={this.handleNavigate.bind(this, NAVIGATE_TYPE.EVENTS)}>*/}
          {/*<View className='list_title'>Events</View>*/}
          {/*<AtIcon prefixClass='ion' value='ios-arrow-forward' size='20' color='#7f7f7f' />*/}
          {/*</View>*/}
        </View>
        <View className='list_view'>
          <View className='list'>
            <View className='list_title'>博客</View>
            <View className='list_content'>{developerInfo.blog.length > 0 ? developerInfo.blog : '--'}</View>
          </View>
          <View className='list'>
            <View className='list_title'>微博</View>
            <View className='list_content'>{developerInfo.weibo.length > 0 ? developerInfo.weibo : '--'}</View>
          </View>
        </View>
        <View className='bottom_view' />
        {
          isShare &&
          <View className='home_view' onClick={this.onClickedHome.bind(this)}>
            <AtIcon value='home'
                    size='30'
                    color='#fff' />
          </View>
        }
        <AtFloatLayout isOpened={isOpen} onClose={this.handleClose.bind(this)}>
          <View className='comment-content'>
            <View className='chat_title'>
              <AtInput
                className='input_title'
                name='title'
                title=''
                type='text'
                value={commentName}
                border={false}
                onChange={this.handleChange.bind(this)}
                disabled={true}
              />
            </View>
            <View className='chat_comment'>
              <AtTextarea
                className='input_comment'
                height={200}
                count={false}
                maxlength={10000}
                value={commentBody}
                onChange={this.handleTextareaChange.bind(this)}
                placeholder='请输入内容...'
              />
            </View>
            <View className='submit' onClick={this.handleSubmit.bind(this)}>
              发送
            </View>
          </View>
        </AtFloatLayout>
        <View className='add_chat' onClick={this.handleAddChatClick}>
          <Image className='chat_icon' src={require('../../../asset/images/add_chat.png')} />
        </View>
      </View>
    )
  }
}
export default DeveloperInfo
