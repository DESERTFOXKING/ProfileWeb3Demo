import { useState, useRef, useEffect } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import type { FormProps } from "antd";
import { ethers, Contract, Transaction } from 'ethers'
import "./index.css";

type FieldType = {
  username?: string;
  email?: string;
  phone?: string;
};

const contractAbi = [
  {
    "inputs": [],
    "name": "email",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "phone",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_usename",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_phone",
        "type": "string"
      }
    ],
    "name": "updateUserInfo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usename",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x4f40833C15588e86CC5a78C2c0802147A2685546';



export default function HomePage() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const provider = useRef<any>()
  const signer = useRef<any>()
  const [spinning, setSpinning] = useState<boolean>(false)
  // const [profileInfo, setProfileInfo] = useState({ username: '', email: '', phone: '' })

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (!signer.current) {
      message.error('请先连接钱包！')
      return
    }
    try {
      setSpinning(true)
      signer.current = await provider.current.getSigner();
      const _contract = new Contract(contractAddress, contractAbi, signer.current)
      
      const res = await _contract.updateUserInfo(values.username, values.email, values.phone)
      await res.wait()
      const tx = await provider.current.getTransactionReceipt(res.hash)
      if (tx.status === 1) {
        message.success('编辑成功！')
        setIsEditing(false)
      }
      setSpinning(false)
    } catch (error) {
      console.log(error)
      message.success('编辑失败！')
      setSpinning(false)
    }
  };


  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    // 处理表单提交错误
  };

  const fetchProfile = async () => {
    if ((window as any).ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults")
        provider.current = ethers.getDefaultProvider()
    
    } else {
 
        provider.current = new ethers.BrowserProvider((window as any).ethereum)
        signer.current = await provider.current.getSigner();
    }
    setSpinning(true)
    const _contract = new Contract(contractAddress, contractAbi, provider.current)
    const res = await Promise.all([_contract.usename(), _contract.email(), _contract.phone()])
    setSpinning(false)

    // setProfileInfo({ username: res[0], email: res[1], phone: res[2] })
    form.setFieldsValue({ username: res[0], email: res[1], phone: res[2] })
  }

  useEffect(() => {
    
    fetchProfile()
  }, [])

  return (
    <div className="container">
      <div className="centerBox">
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          form={form}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="姓名"
            name="username"
            rules={[{ required: true, message: "请输入姓名!" }]}
          >
            <Input readOnly={!isEditing} />
          </Form.Item>

          <Form.Item<FieldType>
            label="邮箱"
            name="email"
            rules={[{ required: true, message: "请输入邮箱!" }]}
          >
            <Input readOnly={!isEditing} />
          </Form.Item>

          <Form.Item<FieldType>
            label="电话"
            name="phone"
            rules={[{ required: true, message: "请输入电话!" }]}
          >
            <Input readOnly={!isEditing} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            {!isEditing && (
              <Button type="primary" onClick={() => setIsEditing(true)}>
                编辑
              </Button>
            )}
            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false)
                  form.resetFields();
                }}
                style={{ marginRight: 12 }}
              >
                取消
              </Button>
            )}
            {isEditing && (
              <Button type="primary" htmlType="submit">
                完成
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
      {spinning && <div className="spinBox">
            <Spin spinning />
      </div>}
    </div>
  );
}
