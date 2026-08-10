import { Input } from '@/shared/components/ui/input';

type ShortAnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * 단답형(주관식) 답 입력칸. 객관식 ChoiceList 와 같은 자리·규격을 쓰되
 * 입력 방식만 다르다(프로토타입 원칙: mvp-g-3역할-hub-opus.html .ansbox/.subjin —
 * "답을 넣는 자리는 객관식·주관식이 같은 자리, 같은 크기").
 * 수능 수학 단답형 정답은 자연수라 inputMode="numeric" + pattern 으로
 * 모바일 숫자 키패드를 유도한다.
 */
export const ShortAnswerInput = ({
  value,
  onChange,
}: ShortAnswerInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        data-testid="short-answer-input"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        placeholder="답을 입력해 주세요 (예: 42)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-21 text-center text-xl font-bold"
      />
      <p className="text-gray-7 text-xs">주관식 문제예요. 정답은 숫자예요.</p>
    </div>
  );
};
