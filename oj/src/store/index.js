import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import contest from './modules/contest'
import api from '@/api'
import types from './types'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production'

const rootState = {
  website: {},
  modalStatus: {
    mode: 'login', // or 'register',
    visible: false
  }
}

const rootGetters = {
  'website' (state) {
    return state.website
  },
  'modalStatus' (state) {
    return state.modalStatus
  }
}

const rootMutations = {
  [types.UPDATE_WEBSITE_CONF] (state, payload) {
    state.website = payload.websiteConfig
  },
  [types.CHANGE_MODAL_STATUS] (state, {mode, visible}) {
    if (mode !== undefined) {
      state.modalStatus.mode = mode
    }
    if (visible !== undefined) {
      state.modalStatus.visible = visible
    }
  }
}

const rootActions = {
  getWebsiteConfig ({commit}) {
    api.getWebsiteConf().then(res => {
      commit(types.UPDATE_WEBSITE_CONF, {
        websiteConfig: res.data.data
      })
    })
  },
  changeModalStatus ({commit}, payload) {
    commit(types.CHANGE_MODAL_STATUS, payload)
  }
}

export default new Vuex.Store({
  modules: {
    user,
    contest
  },
  state: rootState,
  getters: rootGetters,
  mutations: rootMutations,
  actions: rootActions,
  strict: debug
})

export { types }