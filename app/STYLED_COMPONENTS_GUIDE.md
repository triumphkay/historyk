# Styled Components 사용 가이드

## 설치 완료 ✅

styled-components가 설치되고 설정되었습니다!

## 기본 사용법

### 1. 컴포넌트 import

```typescript
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
```

### 2. 스타일 컴포넌트 만들기

```typescript
// View 스타일링
const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.lg}px;
`;

// Text 스타일링
const Title = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xxl}px;
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
`;

// Button 스타일링
const Button = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.lg}px;
`;
```

### 3. 컴포넌트에서 사용

```typescript
const MyScreen = () => {
  return (
    <Container>
      <Title>안녕하세요</Title>
      <Button onPress={() => console.log('클릭!')}>
        <ButtonText>클릭하세요</ButtonText>
      </Button>
    </Container>
  );
};
```

## 테마 사용하기

### 사용 가능한 테마 값들

```typescript
// 색상
props.theme.colors.primary        // #44423B (어두운 색)
props.theme.colors.secondary      // #D54942 (포인트 컬러 1)
props.theme.colors.tertiary       // #5265F8 (포인트 컬러 2)
props.theme.colors.background     // #FDFCFB
props.theme.colors.surface        // #FDFCFB
props.theme.colors.onPrimary      // #FFFFFF
// ... 더 많은 색상은 src/theme/colors.ts 참고

// 간격
props.theme.spacing.xs   // 4
props.theme.spacing.sm   // 8
props.theme.spacing.md   // 16
props.theme.spacing.lg   // 24
props.theme.spacing.xl   // 32
props.theme.spacing.xxl  // 48

// 타이포그래피
props.theme.typography.sizes.xs    // 12
props.theme.typography.sizes.sm    // 14
props.theme.typography.sizes.md    // 16
props.theme.typography.sizes.lg    // 18
props.theme.typography.sizes.xl    // 24
props.theme.typography.sizes.xxl   // 32

props.theme.typography.weights.regular  // '400'
props.theme.typography.weights.medium   // '500'
props.theme.typography.weights.bold     // '700'

// Border Radius
props.theme.borderRadius.sm    // 4
props.theme.borderRadius.md    // 8
props.theme.borderRadius.lg    // 12
props.theme.borderRadius.full  // 999
```

## Props를 받는 컴포넌트

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const StyledButton = styled.TouchableOpacity<ButtonProps>`
  background-color: ${props => 
    props.variant === 'secondary'
      ? props.theme.colors.secondary
      : props.theme.colors.primary
  };
  opacity: ${props => props.disabled ? 0.5 : 1};
  padding: ${props => props.theme.spacing.md}px;
`;

// 사용
<StyledButton variant="secondary" disabled={false}>
  <ButtonText>버튼</ButtonText>
</StyledButton>
```

## 조건부 스타일링

```typescript
const Card = styled.View<{ isActive?: boolean }>`
  background-color: ${props => 
    props.isActive 
      ? props.theme.colors.primaryContainer 
      : props.theme.colors.surface
  };
  border-left-width: ${props => props.isActive ? 4 : 0}px;
  border-left-color: ${props => props.theme.colors.secondary};
`;
```

## 기존 컴포넌트 확장

```typescript
const BaseButton = styled.TouchableOpacity`
  padding: ${props => props.theme.spacing.md}px;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: ${props => props.theme.colors.primary};
`;

const SecondaryButton = styled(BaseButton)`
  background-color: ${props => props.theme.colors.secondary};
`;
```

## attrs로 기본 props 설정

```typescript
const Input = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.colors.onSurfaceVariant,
}))`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md}px;
`;
```

## SASS처럼 중첩 사용하기

styled-components는 SASS처럼 중첩을 지원하지 않지만, 개별 컴포넌트로 분리하여 비슷한 효과를 낼 수 있습니다:

```typescript
const Card = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.lg}px;
`;

const CardHeader = styled.View`
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const CardTitle = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xl}px;
  font-weight: bold;
`;

const CardBody = styled.View`
  flex: 1;
`;

// 사용
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardBody>
    <Text>내용</Text>
  </CardBody>
</Card>
```

## 주의사항

### React Native에서 지원하지 않는 CSS 속성

- `display: block/inline` (항상 flex)
- `position: fixed` (absolute만 가능)
- `float`
- `z-index` 대신 컴포넌트 순서 사용
- `px` 단위 불필요 (숫자만 입력)

### 플랫폼별 스타일

```typescript
import { Platform } from 'react-native';

const Button = styled.TouchableOpacity`
  padding: ${props => props.theme.spacing.md}px;
  ${Platform.select({
    ios: `
      shadow-color: #000;
      shadow-offset: 0px 2px;
      shadow-opacity: 0.1;
      shadow-radius: 4px;
    `,
    android: `
      elevation: 3;
    `,
  })}
`;
```

## 예제 파일

더 많은 예제는 `src/examples/StyledComponentsExample.tsx`를 참고하세요!

## 색상 변경하기

모든 색상은 `src/theme/colors.ts`에서 관리됩니다.
색상을 변경하려면 해당 파일만 수정하면 앱 전체에 반영됩니다.

```typescript
// src/theme/colors.ts
export const LIGHT_COLOR = '#D5D0C8';
export const DARK_COLOR = '#44423B';
export const POINT_COLOR_1 = '#D54942';
export const POINT_COLOR_2 = '#5265F8';
```
