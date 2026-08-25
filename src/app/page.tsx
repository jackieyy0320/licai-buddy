import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search,
  BarChart3,
  Settings,
  LogOut,
  User
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-stone-800">Licai Buddy</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-stone-800 mb-2">欢迎回来，Jackie！</h2>
          <p className="text-stone-500">这是你的财务概览，让我们一起管理好每一分钱。</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">本月收入</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">¥5,000</div>
              <p className="text-xs text-stone-400 mt-1">比上月增长 12%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">本月支出</CardTitle>
              <TrendingDown className="w-5 h-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">¥3,200</div>
              <p className="text-xs text-stone-400 mt-1">比上月减少 8%</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">结余</CardTitle>
              <Wallet className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">¥1,800</div>
              <p className="text-xs text-stone-400 mt-1">健康状态良好</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-6">
            <Plus className="w-4 h-4 mr-2" />
            记一笔
          </Button>
          <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg">
            <BarChart3 className="w-4 h-4 mr-2" />
            查看报表
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <CardTitle>最近交易</CardTitle>
            <CardDescription>你的最新收支记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'expense', name: '外卖午餐', amount: '-¥45', date: '今天 12:30', category: '餐饮' },
                { type: 'income', name: '工资收入', amount: '+¥5,000', date: '昨天', category: '工资' },
                { type: 'expense', name: '打车回家', amount: '-¥28', date: '昨天 20:15', category: '交通' },
                { type: 'expense', name: '超市购物', amount: '-¥156', date: '前天', category: '购物' },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{transaction.name}</p>
                      <p className="text-sm text-stone-400">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {transaction.amount}
                    </p>
                    <p className="text-sm text-stone-400">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
