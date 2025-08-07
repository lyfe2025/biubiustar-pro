-- 创建活动报名表
CREATE TABLE activity_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保同一用户不能重复报名同一活动
  UNIQUE(activity_id, user_id)
);

-- 创建索引
CREATE INDEX idx_activity_registrations_activity ON activity_registrations(activity_id);
CREATE INDEX idx_activity_registrations_user ON activity_registrations(user_id);
CREATE INDEX idx_activity_registrations_status ON activity_registrations(status);
CREATE INDEX idx_activity_registrations_date ON activity_registrations(registration_date);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_activity_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_activity_registrations_updated_at
  BEFORE UPDATE ON activity_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_registrations_updated_at();

-- 创建触发器函数来更新活动参与者数量
CREATE OR REPLACE FUNCTION update_activity_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果是插入新的报名记录
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE activities 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.activity_id;
    RETURN NEW;
  END IF;
  
  -- 如果是更新报名状态
  IF TG_OP = 'UPDATE' THEN
    -- 从registered变为其他状态
    IF OLD.status = 'registered' AND NEW.status != 'registered' THEN
      UPDATE activities 
      SET current_participants = current_participants - 1 
      WHERE id = NEW.activity_id;
    -- 从其他状态变为registered
    ELSIF OLD.status != 'registered' AND NEW.status = 'registered' THEN
      UPDATE activities 
      SET current_participants = current_participants + 1 
      WHERE id = NEW.activity_id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- 如果是删除报名记录
  IF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
    UPDATE activities 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_activity_participants_count
  AFTER INSERT OR UPDATE OR DELETE ON activity_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_participants_count();

-- 启用行级安全策略
ALTER TABLE activity_registrations ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能查看自己的报名记录
CREATE POLICY "Users can view their own registrations" ON activity_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- 活动组织者可以查看自己活动的所有报名记录
CREATE POLICY "Organizers can view their activity registrations" ON activity_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM activities 
      WHERE activities.id = activity_registrations.activity_id 
      AND activities.organizer_id = auth.uid()
    )
  );

-- 认证用户可以报名活动
CREATE POLICY "Authenticated users can register for activities" ON activity_registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 用户可以更新自己的报名记录
CREATE POLICY "Users can update their own registrations" ON activity_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的报名记录（取消报名）
CREATE POLICY "Users can delete their own registrations" ON activity_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- 授权给authenticated角色
GRANT ALL PRIVILEGES ON activity_registrations TO authenticated;