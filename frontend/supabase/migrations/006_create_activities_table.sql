-- 创建活动表
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled', 'completed')),
  category VARCHAR(50),
  tags TEXT[],
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_start_date ON activities(start_date);
CREATE INDEX idx_activities_organizer ON activities(organizer_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_featured ON activities(is_featured);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- 启用行级安全策略
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 所有人可以查看已发布的活动
CREATE POLICY "Anyone can view published activities" ON activities
  FOR SELECT USING (status = 'active');

-- 活动组织者可以管理自己的活动
CREATE POLICY "Organizers can manage their activities" ON activities
  FOR ALL USING (auth.uid() = organizer_id);

-- 认证用户可以创建活动
CREATE POLICY "Authenticated users can create activities" ON activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 授权给anon和authenticated角色
GRANT SELECT ON activities TO anon;
GRANT ALL PRIVILEGES ON activities TO authenticated;