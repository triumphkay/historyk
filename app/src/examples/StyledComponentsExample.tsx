/**
 * Styled Components 사용 예제
 * 
 * 이 파일은 styled-components/native를 사용하는 방법을 보여줍니다.
 * HomeScreen이나 다른 컴포넌트를 이 방식으로 변환할 수 있습니다.
 */

import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

// ============================================
// 기본 사용법
// ============================================

// View 스타일링
const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.lg}px;
`;

// Text 스타일링
const Title = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xxl}px;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.onPrimary};
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

// Surface/Card 스타일링
const Card = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  
  /* Shadow (iOS/Android 모두 작동) */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

// ============================================
// Props를 받는 컴포넌트
// ============================================

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const StyledButton = styled.TouchableOpacity<ButtonProps>`
  background-color: ${props => 
    props.disabled 
      ? props.theme.colors.surfaceDisabled 
      : props.variant === 'secondary'
        ? props.theme.colors.secondary
        : props.theme.colors.primary
  };
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.full}px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const ButtonText = styled.Text<ButtonProps>`
  color: ${props => props.theme.colors.onPrimary};
  font-size: ${props => props.theme.typography.sizes.lg}px;
  font-weight: ${props => props.theme.typography.weights.medium};
`;

// ============================================
// 조건부 스타일링
// ============================================

interface CardItemProps {
  isActive?: boolean;
}

const CardItem = styled.View<CardItemProps>`
  padding: ${props => props.theme.spacing.md}px;
  background-color: ${props => 
    props.isActive 
      ? props.theme.colors.primaryContainer 
      : props.theme.colors.surface
  };
  border-left-width: 4px;
  border-left-color: ${props => 
    props.isActive 
      ? props.theme.colors.secondary 
      : 'transparent'
  };
`;

// ============================================
// 기존 컴포넌트 확장
// ============================================

const BaseButton = styled.TouchableOpacity`
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
`;

// BaseButton을 확장
const PrimaryButton = styled(BaseButton)`
  background-color: ${props => props.theme.colors.primary};
`;

const SecondaryButton = styled(BaseButton)`
  background-color: ${props => props.theme.colors.secondary};
`;

// ============================================
// attrs를 사용한 기본 props 설정
// ============================================

const Input = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.colors.onSurfaceVariant,
}))`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.onSurface};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.outline};
  font-size: ${props => props.theme.typography.sizes.md}px;
`;

// ============================================
// 중첩 스타일링 (SASS처럼)
// ============================================

const QuizCard = styled.View`
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  padding: ${props => props.theme.spacing.lg}px;
`;

const QuizCardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const QuizCardTitle = styled.Text`
  font-size: ${props => props.theme.typography.sizes.xl}px;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.onPrimary};
`;

const QuizCardBody = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// ============================================
// 사용 예제
// ============================================

const ExampleComponent: React.FC = () => {
  return (
    <Container>
      <Title>Styled Components 예제</Title>
      
      <Card>
        <QuizCardTitle>카드 제목</QuizCardTitle>
        <ButtonText>카드 내용</ButtonText>
      </Card>
      
      <StyledButton variant="primary" onPress={() => console.log('클릭!')}>
        <ButtonText>Primary 버튼</ButtonText>
      </StyledButton>
      
      <StyledButton variant="secondary" onPress={() => console.log('클릭!')}>
        <ButtonText variant="secondary">Secondary 버튼</ButtonText>
      </StyledButton>
      
      <StyledButton disabled onPress={() => {}}>
        <ButtonText disabled>비활성화 버튼</ButtonText>
      </StyledButton>
      
      <CardItem isActive>
        <ButtonText>활성화된 아이템</ButtonText>
      </CardItem>
      
      <CardItem>
        <ButtonText>일반 아이템</ButtonText>
      </CardItem>
      
      <Input placeholder="입력하세요..." />
    </Container>
  );
};

export default ExampleComponent;
