<template>
  <div>
    <Form ref="formRegister" :model="formRegister" :rules="ruleRegister">
      <div class="inputName">
        부산대학교 웹메일
      </div>
      <FormItem prop="email">
        <Input
          v-model="formRegister.pnuWebMail"
          :placeholder="$t('m.Email_Address')"
          size="large"
          @on-enter="handleRegister"
          class="emailAuthInput"
          :autofocus="true"
        >
        </Input>

        <Button
          type="primary"
          class="emailAuthBtn"
          @click="handleClickEmailAuthBtn"
          >인증</Button
        >
      </FormItem>
      <FormItem prop="emailAuthCode" v-if="emailAuthCodeInputState">
        <Input
          v-model="formRegister.pnuAuthCode"
          :placeholder="$t('m.Email_Auth_Code')"
          size="large"
          @on-enter="handleRegister"
          class="emailCodeInput"
        >
        </Input>
        <Button type="primary" class="emailAuthBtn emailCodeBtn" @click=""
          >인증완료</Button
        >
      </FormItem>
      <div class="inputName">
        닉네임
      </div>
      <FormItem prop="nickname">
        <Input
          type="text"
          v-model="formRegister.nickname"
          :placeholder="$t('m.RegisterNickname')"
          size="large"
          @on-enter="handleRegister"
        >
        </Input>
      </FormItem>
      <div class="inputName">
        단과대학 선택
      </div>
      <CustomDropDown :dropdownType="DropDownType.COLLEGE" />
      <div class="inputName">
        학과선택
      </div>
      <CustomDropDown :dropdownType="DropDownType.MAJOR" />
      <div class="inputName">
        비밀번호
      </div>
      <FormItem prop="password">
        <Input
          type="password"
          v-model="formRegister.password"
          :placeholder="$t('m.RegisterPassword')"
          size="large"
          @on-enter="handleRegister"
        >
        </Input>
      </FormItem>
      <div class="inputName">
        비밀번호 확인
      </div>
      <FormItem prop="passwordAgain">
        <Input
          type="password"
          v-model="formRegister.passwordAgain"
          :placeholder="$t('m.Password_Again')"
          size="large"
          @on-enter="handleRegister"
        >
        </Input>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        @click="handleRegister"
        class="btn"
        long
        :loading="btnRegisterLoading"
      >
        {{ $t("m.UserRegister") }}
      </Button>
      <div style="text-align: center">
        <a class="redirectLogin" @click.stop="switchMode('login')">{{
          $t("m.UserLogin")
        }}</a>
      </div>
      <!--      <Button-->
      <!--        type="ghost"-->
      <!--        @click="switchMode('login')"-->
      <!--        class="btn" long>-->
      <!--        {{$t('m.Already_Registed')}}-->
      <!--      </Button>-->
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import { mapGetters, mapActions } from "vuex";
import api from "@oj/api";
import { FormMixin } from "@oj/components/mixins";
import CustomDropDown from "../../components/dropdown/CustomDropDown.vue";
import { DropDownType } from "../../components/dropdown/test";

export default {
  mixins: [FormMixin],
  components: {
    CustomDropDown
  },
  mounted() {
    this.getCaptchaSrc();
  },
  data() {
    const CheckUsernameNotExist = (rule, value, callback) => {
      api.checkUsernameOrEmail(value, undefined).then(
        res => {
          if (res.data.data.username === true) {
            callback(new Error(this.$i18n.t("m.The_username_already_exists")));
          } else {
            callback();
          }
        },
        _ => callback()
      );
    };
    const CheckEmailNotExist = (rule, value, callback) => {
      api.checkUsernameOrEmail(undefined, value).then(
        res => {
          if (res.data.data.email === true) {
            callback(new Error(this.$i18n.t("m.The_email_already_exists")));
          } else {
            callback();
          }
        },
        _ => callback()
      );
    };
    const CheckPassword = (rule, value, callback) => {
      if (this.formRegister.password !== "") {
        // 对第二个密码框再次验证
        this.$refs.formRegister.validateField("passwordAgain");
      }
      callback();
    };

    const CheckAgainPassword = (rule, value, callback) => {
      if (value !== this.formRegister.password) {
        callback(new Error(this.$i18n.t("m.password_does_not_match")));
      }
      callback();
    };

    return {
      btnRegisterLoading: false,
      emailAuthCodeInputState: false,
      name1: "단과대학 선택",
      name2: "학과 선택",
      formRegister: {
        pnuWebMail: "",
        pnuAuthCode: "",
        nickname: "",
        college: "",
        major: "",
        username: "",
        password: "",
        passwordAgain: "",
        captcha: ""
      },
      ruleRegister: {
        username: [
          { required: true, trigger: "blur" },
          { validator: CheckUsernameNotExist, trigger: "blur" }
        ],
        email: [
          { required: true, type: "email", trigger: "blur" },
          { validator: CheckEmailNotExist, trigger: "blur" }
        ],
        password: [
          { required: true, trigger: "blur", min: 6, max: 20 },
          { validator: CheckPassword, trigger: "blur" }
        ],
        passwordAgain: [
          { required: true, validator: CheckAgainPassword, trigger: "change" }
        ],
        captcha: [{ required: true, trigger: "blur", min: 1, max: 10 }]
      }
    };
  },
  methods: {
    ...mapActions(["changeModalStatus", "getProfile"]),
    handleClickEmailAuthBtn() {
      this.$success("인증메일이 성공적으로 전송되었습니다.");
      this.emailAuthCodeInputState = true;
      api.applyUserEmailValidCheck(this.formRegister.pnuWebMail);
    },
    switchMode(mode) {
      this.changeModalStatus({
        mode,
        visible: true
      });
    },
    handleRegister() {
      this.validateForm("formRegister").then(valid => {
        let formData = Object.assign({}, this.formRegister);
        delete formData["passwordAgain"];
        this.btnRegisterLoading = true;
        api.register(formData).then(
          res => {
            this.$success(this.$i18n.t("m.Thanks_for_registering"));
            this.switchMode("login");
            this.btnRegisterLoading = false;
          },
          _ => {
            this.getCaptchaSrc();
            this.formRegister.captcha = "";
            this.btnRegisterLoading = false;
          }
        );
      });
    }
  },
  computed: {
    DropDownType() {
      return DropDownType;
    },
    ...mapGetters(["website", "modalStatus"])
  }
};
</script>

<style scoped lang="less">
.footer {
  overflow: auto;
  margin-top: 20px;
  margin-bottom: -15px;
  text-align: left;
  .btn {
    margin: 0 0 15px 0;
    &:last-child {
      margin: 0;
    }
  }
}
.btn {
  height: 45px;
  background-color: #4a86c0;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
}
.inputName {
  font-size: small;
  font-weight: 800;
  margin-bottom: 5px;
  margin-left: 1px;
}
.emailAuthBtn {
  height: 36px;
  background-color: #4a86c0;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
}
.emailAuthInput {
  width: 303px;
}
.emailCodeInput {
  width: 280px;
  animation: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
.emailCodeBtn {
  animation: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
.redirectLogin {
  color: #7a7a7a;
  text-decoration-line: underline;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
