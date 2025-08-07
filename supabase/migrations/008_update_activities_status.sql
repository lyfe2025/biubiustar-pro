-- 更新activities表的状态字段，添加preparing和ongoing状态
-- 支持的状态：preparing（筹备中）、ongoing（进行中）、completed（已结束）、cancelled（已取消）、draft（草稿）、active（活跃）

-- 删除现有的状态检查约束
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_status_check;

-- 添加新的状态检查约束，包含所有需要的状态
ALTER TABLE activities ADD CONSTRAINT activities_status_check 
CHECK (status IN ('draft', 'preparing', 'ongoing', 'completed', 'cancelled', 'active'));

-- 更新默认状态为preparing
ALTER TABLE activities ALTER COLUMN status SET DEFAULT 'preparing';

-- 添加状态相关的索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_end_date ON activities(end_date);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);

-- 添加用于自动状态计算的函数
CREATE OR REPLACE FUNCTION calculate_activity_status(start_date timestamptz, end_date timestamptz, manual_status varchar DEFAULT NULL)
RETURNS varchar AS $$
BEGIN
    -- 如果手动设置了状态且不是基于时间的状态，则使用手动状态
    IF manual_status IS NOT NULL AND manual_status IN ('draft', 'cancelled') THEN
        RETURN manual_status;
    END IF;
    
    -- 基于时间自动计算状态
    IF start_date > NOW() THEN
        RETURN 'preparing';  -- 筹备中
    ELSIF start_date <= NOW() AND end_date > NOW() THEN
        RETURN 'ongoing';    -- 进行中
    ELSE
        RETURN 'completed';  -- 已结束
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器函数来自动更新状态
CREATE OR REPLACE FUNCTION update_activity_status_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有在状态不是手动设置的特殊状态时才自动更新
    IF NEW.status NOT IN ('draft', 'cancelled') THEN
        NEW.status := calculate_activity_status(NEW.start_date, NEW.end_date, NEW.status);
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_activity_status ON activities;
CREATE TRIGGER trigger_update_activity_status
    BEFORE INSERT OR UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_status_trigger();

-- 更新现有数据的状态（基于时间自动计算）
UPDATE activities 
SET status = calculate_activity_status(start_date, end_date, status)
WHERE status NOT IN ('draft', 'cancelled');

-- 确保RLS策略正确设置
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

-- 创建新的RLS策略
CREATE POLICY "Activities are viewable by everyone" ON activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = organizer_id);

-- 授予必要的权限
GRANT SELECT ON activities TO anon;
GRANT ALL PRIVILEGES ON activities TO authenticated;

-- 添加注释
COMMENT ON COLUMN activities.status IS '活动状态：draft(草稿), preparing(筹备中), ongoing(进行中), completed(已结束), cancelled(已取消), active(活跃-兼容旧数据)';
COMMENT ON FUNCTION calculate_activity_status IS '根据活动开始和结束时间自动计算活动状态';
COMMENT ON FUNCTION update_activity_status_trigger IS '自动更新活动状态的触发器函数';