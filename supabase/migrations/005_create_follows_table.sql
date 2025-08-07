-- 创建关注关系表
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT follows_not_self CHECK (follower_id != following_id)
);

-- 创建唯一索引防止重复关注
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_unique ON follows(follower_id, following_id);

-- 创建其他索引
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- 启用行级安全策略
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- 授权给anon和authenticated角色
GRANT SELECT ON follows TO anon;
GRANT ALL PRIVILEGES ON follows TO authenticated;

-- 创建更新用户关注数的函数
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 增加关注者的关注数
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    -- 增加被关注者的粉丝数
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 减少关注者的关注数
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    -- 减少被关注者的粉丝数
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_user_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();