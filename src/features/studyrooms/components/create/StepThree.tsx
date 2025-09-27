import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function StepThree() {
  return (
    <>
      <Form.Item>
        <Form.Label>초대할 학생이 있나요?</Form.Label>
        <Input />
      </Form.Item>
      <div>
        <p>학생을 초대하면 연결된 보호자는 자동으로 함께 입장합니다.</p>
        <p>
          각 수업 노트는 보호자에게 공개하거나 비공개로 설정할 수 있습니다.
          학생과 연결되지 않은 보호자는 스터디룸에 입장할 수 없습니다.
        </p>
      </div>
      <div className="flex space-y-4">
        <p className="text-muted-foreground text-sm">
          학생을 초대하지 않아도 스터디룸 기능을 먼저 사용할 수 있어요
        </p>
        <Button
          type="submit"
          className="w-full"
        >
          완료
        </Button>
      </div>
    </>
  );
}
