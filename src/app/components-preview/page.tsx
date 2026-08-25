import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ComponentsPreview() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">UI 组件预览</h1>
        
        {/* Buttons */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>按钮</CardTitle>
            <CardDescription>不同样式和状态的按钮组件</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="bg-indigo-500 hover:bg-indigo-600">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="outline">边框按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button disabled>禁用按钮</Button>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>输入框</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" placeholder="请输入邮箱" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="请输入密码" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="invite">邀请码</Label>
              <Input id="invite" placeholder="请输入邀请码" className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>卡片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base">统计卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">¥5,000</div>
                  <p className="text-sm text-stone-500">本月收入</p>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base">统计卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">¥3,200</div>
                  <p className="text-sm text-stone-500">本月支出</p>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base">统计卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">¥1,800</div>
                  <p className="text-sm text-stone-500">本月结余</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>徽章</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>默认</Badge>
            <Badge variant="secondary">次要</Badge>
            <Badge variant="outline">边框</Badge>
            <Badge className="bg-emerald-500">成功</Badge>
            <Badge className="bg-rose-500">危险</Badge>
            <Badge className="bg-amber-500">警告</Badge>
          </CardContent>
        </Card>

        {/* Avatar */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>头像</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Avatar>
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12">
              <AvatarFallback className="text-lg">JD</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {/* Separator */}
        <Card className="mb-8 bg-white border-stone-200">
          <CardHeader>
            <CardTitle>分割线</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div className="text-sm text-stone-500">这是一段文字</div>
              <Separator />
            </div>
          </CardContent>
        </Card>

        {/* Login Form Demo */}
        <Card className="mb-8 bg-white border-stone-200 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">登录</CardTitle>
            <CardDescription className="text-center">欢迎回来，请登录你的账号</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">邮箱</Label>
                <Input id="login-email" placeholder="name@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">密码</Label>
                <Input id="login-password" type="password" />
              </div>
              <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600">
                登录
              </Button>
              <p className="text-center text-sm text-stone-500">
                还没有账号？<span className="text-indigo-500 hover:underline cursor-pointer">注册</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
